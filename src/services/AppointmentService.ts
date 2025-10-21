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
