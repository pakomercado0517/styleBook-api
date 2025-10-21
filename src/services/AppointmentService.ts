import Appointments from "../models/Appointments";
import Users from "../models/Users";
import Services from "../models/Services";
import Employees from "../models/Employees";
import {
  localToUtc,
  utcToLocal,
  formatInTimezone,
  datesOverlap,
} from "../utils/dateUtils";
import { AppError } from "../utils/errors";

export interface CreateAppointmentDTO {
  service_id: number;
  employee_id: number;
  start_date: string;
  end_date: string;
}

export interface UpdateAppointmentDTO {
  status?: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
  notes?: string;
}

export interface AppointmentResponse {
  id: number;
  client_id: number;
  employee_id: number;
  service_id: number;
  provider_id: number;
  start_date_utc: string;
  start_date_local: string;
  end_date_utc: string;
  end_date_local: string;
  formatted_dates: {
    start: string;
    end: string;
  };
  status: string;
  notes: string | null;
  final_price: number;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AppointmentService {
  /**
   * Crear una nueva cita
   * @throws Error si hay conflicto de horario o datos inválidos
   */
  async createAppointment(
    clientId: number,
    dto: CreateAppointmentDTO
  ): Promise<AppointmentResponse> {
    // 1. Obtener información del cliente
    const client = await Users.findByPk(clientId);
    if (!client) {
      throw new Error(`Client ${clientId} not found`);
    }

    // 2. Obtener información del servicio
    const service = await Services.findByPk(dto.service_id);
    if (!service) {
      throw new Error(`Service ${dto.service_id} not found`);
    }

    // 3. Obtener información del empleado
    const employee = await Employees.findByPk(dto.employee_id);
    if (!employee) {
      throw new Error(`Employee ${dto.employee_id} not found`);
    }

    // 4. Convertir fechas de timezone local a UTC
    const startUtc = localToUtc(dto.start_date, client.timezone);
    const endUtc = localToUtc(dto.end_date, client.timezone);

    // 5. Validar que la fecha de fin sea después de la de inicio
    if (startUtc >= endUtc) {
      throw new Error("End date must be after start date");
    }

    // 6. Validar que la duración coincida con el servicio
    const durationMinutes = Math.round(
      (endUtc.getTime() - startUtc.getTime()) / (1000 * 60)
    );
    if (durationMinutes !== service.duration_minutes) {
      throw new Error(`Duration must be ${service.duration_minutes} minutes`);
    }

    // 7. Verificar conflictos de horario
    const conflicts = await Appointments.findAll({
      where: {
        employee_id: dto.employee_id,
        status: ["pending", "confirmed"],
      },
    });

    const hasConflict = conflicts.some((apt: Appointments) =>
      datesOverlap(startUtc, endUtc, apt.start_date, apt.end_date)
    );

    if (hasConflict) {
      throw new Error("Time slot is not available");
    }

    // 8. Crear la cita
    const appointment = await Appointments.create({
      client_id: clientId,
      employee_id: dto.employee_id,
      service_id: dto.service_id,
      provider_id: employee.provider_id,
      start_date: startUtc,
      end_date: endUtc,
      status: "pending",
      final_price: service.price,
    });

    // 9. Retornar con conversiones
    return this._mapToResponse(appointment, client.timezone);
  }

  /**
   * Obtener todas las citas del cliente
   */
  async getClientAppointments(
    clientId: number,
    page: number = 1,
    limit: number = 20
  ): Promise<{ appointments: AppointmentResponse[]; total: number }> {
    const client = await Users.findByPk(clientId);
    if (!client) {
      throw new Error(`Client ${clientId} not found`);
    }

    const { count, rows } = await Appointments.findAndCountAll({
      where: { client_id: clientId },
      offset: (page - 1) * limit,
      limit,
      order: [["start_date", "DESC"]],
    });

    return {
      appointments: rows.map((apt: Appointments) =>
        this._mapToResponse(apt, client.timezone)
      ),
      total: count,
    };
  }

  /**
   * Obtener una cita por ID
   */
  async getAppointmentById(
    appointmentId: number
  ): Promise<AppointmentResponse> {
    const appointment = await Appointments.findByPk(appointmentId);
    if (!appointment) {
      throw new Error(`Appointment ${appointmentId} not found`);
    }

    const client = await Users.findByPk(appointment.client_id);
    if (!client) {
      throw new Error(`Client not found for appointment ${appointmentId}`);
    }

    return this._mapToResponse(appointment, client.timezone);
  }

  /**
   * Actualizar estado o notas de una cita
   */
  async updateAppointment(
    appointmentId: number,
    dto: UpdateAppointmentDTO
  ): Promise<AppointmentResponse> {
    const appointment = await Appointments.findByPk(appointmentId);
    if (!appointment) {
      throw new Error(`Appointment ${appointmentId} not found`);
    }

    if (dto.status) {
      appointment.status = dto.status;
    }

    if (dto.notes !== undefined) {
      appointment.notes = dto.notes;
    }

    await appointment.save();

    const client = await Users.findByPk(appointment.client_id);
    if (!client) {
      throw new Error(`Client not found for appointment ${appointmentId}`);
    }

    return this._mapToResponse(appointment, client.timezone);
  }

  /**
   * Cancelar una cita
   */
  async cancelAppointment(appointmentId: number): Promise<AppointmentResponse> {
    const appointment = await Appointments.findByPk(appointmentId);
    if (!appointment) {
      throw new Error(`Appointment ${appointmentId} not found`);
    }

    if (appointment.status === "completed") {
      throw new Error("Cannot cancel a completed appointment");
    }

    appointment.status = "cancelled";
    await appointment.save();

    const client = await Users.findByPk(appointment.client_id);
    if (!client) {
      throw new Error(`Client not found for appointment ${appointmentId}`);
    }

    return this._mapToResponse(appointment, client.timezone);
  }

  /**
   * Confirmar una cita (solo proveedor)
   * Una cita debe estar en estado "pending" para ser confirmada
   * @throws Error si la cita no existe, no está pending, o no pertenece al proveedor
   */
  async confirmAppointment(
    appointmentId: number,
    providerId: number
  ): Promise<AppointmentResponse> {
    // 1. Obtener cita
    const appointment = await Appointments.findByPk(appointmentId);
    if (!appointment) {
      throw new AppError(`Cita ${appointmentId} no encontrada`, 404);
    }

    // 2. Verificar que pertenezca al proveedor
    if (appointment.provider_id !== providerId) {
      throw new AppError(`No tienes permisos para confirmar esta cita`, 403);
    }

    // 3. Verificar que esté en estado "pending"
    if (appointment.status !== "pending") {
      throw new AppError(
        `Solo se pueden confirmar citas en estado "pending". Estado actual: ${appointment.status}`,
        409
      );
    }

    // 4. Cambiar estado a "confirmed"
    appointment.status = "confirmed";
    await appointment.save();

    // 5. Obtener cliente para timezone
    const client = await Users.findByPk(appointment.client_id);
    if (!client) {
      throw new AppError(`Cliente no encontrado para la cita`, 404);
    }

    return this._mapToResponse(appointment, client.timezone);
  }

  /**
   * Obtener todas las citas pendientes de un proveedor
   * Útil para que el proveedor vea qué citas necesita confirmar
   */
  async getProviderPendingAppointments(
    providerId: number,
    limit: number = 20,
    offset: number = 0
  ): Promise<{
    appointments: AppointmentResponse[];
    total: number;
    pending_count: number;
  }> {
    const { count, rows } = await Appointments.findAndCountAll({
      where: {
        provider_id: providerId,
        status: "pending",
      },
      limit,
      offset,
      order: [["start_date", "ASC"]],
    });

    // Obtener timezone del primer cliente (si existe)
    let defaultTimezone = "America/Mexico_City";
    if (rows.length > 0) {
      const client = await Users.findByPk(rows[0].client_id);
      if (client) {
        defaultTimezone = client.timezone;
      }
    }

    return {
      appointments: rows.map((apt: Appointments) =>
        this._mapToResponse(apt, defaultTimezone)
      ),
      total: count,
      pending_count: rows.length,
    };
  }

  /**
   * Obtener todas las citas de un proveedor (confirmadas y pendientes)
   */
  async getProviderAppointments(
    providerId: number,
    status?: "pending" | "confirmed" | "completed" | "cancelled" | "no_show",
    limit: number = 20,
    offset: number = 0
  ): Promise<{
    appointments: AppointmentResponse[];
    total: number;
  }> {
    const whereClause: any = { provider_id: providerId };

    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await Appointments.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["start_date", "DESC"]],
    });

    // Obtener timezone del primer cliente
    let defaultTimezone = "America/Mexico_City";
    if (rows.length > 0) {
      const client = await Users.findByPk(rows[0].client_id);
      if (client) {
        defaultTimezone = client.timezone;
      }
    }

    return {
      appointments: rows.map((apt: Appointments) =>
        this._mapToResponse(apt, defaultTimezone)
      ),
      total: count,
    };
  }

  /**
   * Mapear modelo a respuesta con conversiones de zona horaria
   */
  private _mapToResponse(
    appointment: Appointments,
    timezone: string
  ): AppointmentResponse {
    return {
      id: appointment.id,
      client_id: appointment.client_id,
      employee_id: appointment.employee_id,
      service_id: appointment.service_id,
      provider_id: appointment.provider_id,
      start_date_utc: appointment.start_date.toISOString(),
      start_date_local: utcToLocal(
        appointment.start_date,
        timezone
      ).toISOString(),
      end_date_utc: appointment.end_date.toISOString(),
      end_date_local: utcToLocal(appointment.end_date, timezone).toISOString(),
      formatted_dates: {
        start: formatInTimezone(
          appointment.start_date,
          "dd/MM/yyyy HH:mm",
          timezone
        ),
        end: formatInTimezone(
          appointment.end_date,
          "dd/MM/yyyy HH:mm",
          timezone
        ),
      },
      status: appointment.status,
      notes: appointment.notes,
      final_price: appointment.final_price,
      timezone,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };
  }
}
