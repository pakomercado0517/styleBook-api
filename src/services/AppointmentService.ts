import Appointments from "../models/Appointments";
import Users from "../models/Users";
import Services from "../models/Services";
import Employees from "../models/Employees";
import Providers from "../models/Providers";
import {
  localToUtc,
  utcToLocal,
  formatInTimezone,
  datesOverlap,
} from "../utils/dateUtils";
import { AppError } from "../utils/errors";
import { Op } from "sequelize";

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

export interface RescheduleAppointmentDTO {
  start_date: string;
  end_date: string;
  employee_id?: number;
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

export interface AppointmentWithDetailsResponse extends AppointmentResponse {
  service: {
    id: number;
    name: string;
    description: string | null;
    price: number;
    duration_minutes: number;
    category: string;
    image_url: string | null;
  };
  provider: {
    id: number;
    business_name: string;
    description: string | null;
    business_type: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    average_rating: number | null;
  };
  employee: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    specialty: string | null;
    photo_url: string | null;
    rating: number | null;
  } | null;
  client: {
    id: number;
    name: string;
    apellido: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
  } | null;
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
   * Obtener todas las citas del cliente con datos relacionados
   * @param employee_id - Filtro opcional por empleado
   * @param pastDays - Filtro opcional: número de días antes de la fecha actual para obtener citas pasadas
   * @param filter - Filtro opcional: "upcoming" para citas futuras
   */
  async getClientAppointments(
    clientId: number,
    page: number = 1,
    limit: number = 20,
    employee_id?: number,
    pastDays?: number,
    filter?: "upcoming"
  ): Promise<{ appointments: AppointmentWithDetailsResponse[]; total: number }> {
    const client = await Users.findByPk(clientId);
    if (!client) {
      throw new Error(`Client ${clientId} not found`);
    }

    const whereClause: any = { client_id: clientId };
    if (employee_id) {
      whereClause.employee_id = employee_id;
    }

    // Filtro por fecha pasada: citas de los últimos N días
    if (pastDays !== undefined && pastDays > 0) {
      const now = new Date();
      const pastDate = new Date(now.getTime() - pastDays * 24 * 60 * 60 * 1000);
      whereClause.start_date = {
        [Op.gte]: pastDate,
        [Op.lt]: now,
      };
    } else if (filter === "upcoming") {
      // Filtro para citas futuras
      whereClause.start_date = { [Op.gte]: new Date() };
    }

    const { count, rows } = await Appointments.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Services,
          as: "service",
          attributes: [
            "id",
            "name",
            "description",
            "price",
            "duration_minutes",
            "category",
            "image_url",
          ],
        },
        {
          model: Providers,
          as: "provider",
          attributes: [
            "id",
            "business_name",
            "description",
            "business_type",
            "address",
            "city",
            "country",
            "average_rating",
          ],
        },
        {
          model: Employees,
          as: "employee",
          required: false,
          attributes: [
            "id",
            "name",
            "email",
            "phone",
            "specialty",
            "photo_url",
            "rating",
          ],
        },
        {
          model: Users,
          as: "client",
          required: false,
          attributes: [
            "id",
            "name",
            "apellido",
            "email",
            "phone",
            "avatar_url",
          ],
        },
      ],
      offset: (page - 1) * limit,
      limit,
      order: [["start_date", "DESC"]],
    });

    return {
      appointments: rows.map((apt: Appointments) =>
        this._mapToClientResponse(apt, client.timezone)
      ),
      total: count,
    };
  }

  /**
   * Obtener una cita por ID con datos relacionados
   */
  async getAppointmentById(
    appointmentId: number
  ): Promise<AppointmentWithDetailsResponse> {
    const appointment = await Appointments.findByPk(appointmentId, {
      include: [
        {
          model: Services,
          as: "service",
          attributes: [
            "id",
            "name",
            "description",
            "price",
            "duration_minutes",
            "category",
            "image_url",
          ],
        },
        {
          model: Providers,
          as: "provider",
          attributes: [
            "id",
            "business_name",
            "description",
            "business_type",
            "address",
            "city",
            "country",
            "average_rating",
          ],
        },
        {
          model: Employees,
          as: "employee",
          required: false,
          attributes: [
            "id",
            "name",
            "email",
            "phone",
            "specialty",
            "photo_url",
            "rating",
          ],
        },
      ],
    });

    if (!appointment) {
      throw new Error(`Appointment ${appointmentId} not found`);
    }

    const client = await Users.findByPk(appointment.client_id);
    if (!client) {
      throw new Error(`Client not found for appointment ${appointmentId}`);
    }

    return this._mapToClientResponse(appointment, client.timezone);
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
   * Obtener todas las citas pendientes de un proveedor con datos relacionados
   * Útil para que el proveedor vea qué citas necesita confirmar
   * @param employee_id - Filtro opcional por empleado
   */
  async getProviderPendingAppointments(
    providerId: number,
    limit: number = 20,
    offset: number = 0,
    employee_id?: number
  ): Promise<{
    appointments: AppointmentWithDetailsResponse[];
    total: number;
    pending_count: number;
  }> {
    const whereClause: any = {
      provider_id: providerId,
      status: "pending",
    };

    if (employee_id) {
      whereClause.employee_id = employee_id;
    }

    const { count, rows } = await Appointments.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Services,
          as: "service",
          attributes: [
            "id",
            "name",
            "description",
            "price",
            "duration_minutes",
            "category",
            "image_url",
          ],
        },
        {
          model: Providers,
          as: "provider",
          attributes: [
            "id",
            "business_name",
            "description",
            "business_type",
            "address",
            "city",
            "country",
            "average_rating",
          ],
        },
        {
          model: Employees,
          as: "employee",
          required: false,
          attributes: [
            "id",
            "name",
            "email",
            "phone",
            "specialty",
            "photo_url",
            "rating",
          ],
        },
        {
          model: Users,
          as: "client",
          required: false,
          attributes: [
            "id",
            "name",
            "apellido",
            "email",
            "phone",
            "avatar_url",
          ],
        },
      ],
      limit,
      offset,
      order: [["start_date", "ASC"]],
    });

    // Obtener timezone del primer cliente (si existe)
    let defaultTimezone = "America/Mexico_City";
    if (rows.length > 0 && rows[0].client) {
      defaultTimezone = rows[0].client.timezone;
    }

    return {
      appointments: rows.map((apt: Appointments) =>
        this._mapToClientResponse(apt, defaultTimezone)
      ),
      total: count,
      pending_count: rows.length,
    };
  }

  /**
   * Obtener todas las citas de un proveedor con datos relacionados
   * @param employee_id - Filtro opcional por empleado
   * @param start_date - Filtro opcional: fecha de inicio del período (ISO string)
   * @param end_date - Filtro opcional: fecha de fin del período (ISO string)
   */
  async getProviderAppointments(
    providerId: number,
    status?: "pending" | "confirmed" | "completed" | "cancelled" | "no_show",
    limit: number = 20,
    offset: number = 0,
    employee_id?: number,
    start_date?: string,
    end_date?: string
  ): Promise<{
    appointments: AppointmentWithDetailsResponse[];
    total: number;
  }> {
    const whereClause: any = { provider_id: providerId };

    if (status) {
      whereClause.status = status;
    }

    if (employee_id) {
      whereClause.employee_id = employee_id;
    }

    // Filtro por rango de fechas
    if (start_date || end_date) {
      whereClause.start_date = {};
      if (start_date) {
        // Parsear fecha ISO - Date constructor maneja ISO 8601 correctamente
        const startDateParsed = new Date(start_date);
        // Si la fecha no tiene componente de tiempo, establecer inicio del día en UTC
        if (!start_date.includes("T")) {
          startDateParsed.setUTCHours(0, 0, 0, 0);
        }
        whereClause.start_date[Op.gte] = startDateParsed;
      }
      if (end_date) {
        // Parsear fecha ISO
        const endDateParsed = new Date(end_date);
        // Si la fecha no tiene componente de tiempo, establecer fin del día en UTC
        if (!end_date.includes("T")) {
          endDateParsed.setUTCHours(23, 59, 59, 999);
        } else {
          // Si tiene hora, agregar 1 día para incluir todo el día final
          endDateParsed.setTime(endDateParsed.getTime() + 24 * 60 * 60 * 1000);
        }
        whereClause.start_date[Op.lt] = endDateParsed;
      }
    }

    const { count, rows } = await Appointments.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Services,
          as: "service",
          attributes: [
            "id",
            "name",
            "description",
            "price",
            "duration_minutes",
            "category",
            "image_url",
          ],
        },
        {
          model: Providers,
          as: "provider",
          attributes: [
            "id",
            "business_name",
            "description",
            "business_type",
            "address",
            "city",
            "country",
            "average_rating",
          ],
        },
        {
          model: Employees,
          as: "employee",
          required: false,
          attributes: [
            "id",
            "name",
            "email",
            "phone",
            "specialty",
            "photo_url",
            "rating",
          ],
        },
        {
          model: Users,
          as: "client",
          required: false,
          attributes: [
            "id",
            "name",
            "apellido",
            "email",
            "phone",
            "avatar_url",
          ],
        },
      ],
      limit,
      offset,
      order: [["start_date", "DESC"]],
    });

    // Obtener timezone del primer cliente
    let defaultTimezone = "America/Mexico_City";
    if (rows.length > 0 && rows[0].client) {
      defaultTimezone = rows[0].client.timezone;
    }

    return {
      appointments: rows.map((apt: Appointments) =>
        this._mapToClientResponse(apt, defaultTimezone)
      ),
      total: count,
    };
  }

  /**
   * Reagendar una cita (cambiar fecha/hora y opcionalmente empleado)
   * Solo se puede reagendar si la cita no está completada o cancelada
   * @throws Error si la cita no existe, está completada/cancelada, o hay conflicto de horario
   */
  async rescheduleAppointment(
    appointmentId: number,
    userId: number,
    dto: RescheduleAppointmentDTO
  ): Promise<AppointmentResponse> {
    // 1. Obtener la cita
    const appointment = await Appointments.findByPk(appointmentId);
    if (!appointment) {
      throw new AppError(`Cita ${appointmentId} no encontrada`, 404);
    }

    // 2. Validar permisos: solo el cliente o el proveedor pueden reagendar
    if (
      appointment.client_id !== userId &&
      appointment.provider_id !== userId
    ) {
      throw new AppError("No tienes permisos para reagendar esta cita", 403);
    }

    // 3. Validar que la cita no esté completada o cancelada
    if (appointment.status === "completed") {
      throw new AppError("No se puede reagendar una cita completada", 409);
    }

    if (appointment.status === "cancelled") {
      throw new AppError("No se puede reagendar una cita cancelada", 409);
    }

    // 4. Obtener información del cliente para timezone
    const client = await Users.findByPk(appointment.client_id);
    if (!client) {
      throw new AppError(`Cliente no encontrado para la cita`, 404);
    }

    // 5. Obtener información del servicio
    const service = await Services.findByPk(appointment.service_id);
    if (!service) {
      throw new AppError(`Servicio no encontrado`, 404);
    }

    // 6. Determinar el empleado (usar el nuevo si se proporciona, sino mantener el actual)
    const employeeId = dto.employee_id || appointment.employee_id;
    const employee = await Employees.findByPk(employeeId);
    if (!employee) {
      throw new AppError(`Empleado ${employeeId} no encontrado`, 404);
    }

    // 7. Validar que el empleado pertenezca al mismo proveedor
    if (employee.provider_id !== appointment.provider_id) {
      throw new AppError("El empleado debe pertenecer al mismo proveedor", 400);
    }

    // 8. Convertir fechas de timezone local a UTC
    const startUtc = localToUtc(dto.start_date, client.timezone);
    const endUtc = localToUtc(dto.end_date, client.timezone);

    // 9. Validar que la fecha de fin sea después de la de inicio
    if (startUtc >= endUtc) {
      throw new AppError(
        "La fecha de fin debe ser posterior a la fecha de inicio",
        400
      );
    }

    // 10. Validar que la duración coincida con el servicio
    const durationMinutes = Math.round(
      (endUtc.getTime() - startUtc.getTime()) / (1000 * 60)
    );
    if (durationMinutes !== service.duration_minutes) {
      throw new AppError(
        `La duración debe ser ${service.duration_minutes} minutos`,
        400
      );
    }

    // 11. Verificar conflictos de horario (excluyendo la cita actual)
    const conflicts = await Appointments.findAll({
      where: {
        employee_id: employeeId,
        status: ["pending", "confirmed"],
        id: { [Op.ne]: appointmentId },
      },
    });

    const hasConflict = conflicts.some((apt: Appointments) =>
      datesOverlap(startUtc, endUtc, apt.start_date, apt.end_date)
    );

    if (hasConflict) {
      throw new AppError(
        "El nuevo horario no está disponible (conflicto con otra cita)",
        409
      );
    }

    // 12. Actualizar la cita
    appointment.start_date = startUtc;
    appointment.end_date = endUtc;
    appointment.employee_id = employeeId;

    // 13. Si la cita estaba confirmada, cambiar a pending para que el proveedor confirme de nuevo
    if (appointment.status === "confirmed") {
      appointment.status = "pending";
    }

    await appointment.save();

    // 14. Retornar con conversiones
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

  /**
   * Mapear cita con datos relacionados para respuesta del cliente
   */
  private _mapToClientResponse(
    appointment: Appointments,
    timezone: string
  ): AppointmentWithDetailsResponse {
    const baseResponse = this._mapToResponse(appointment, timezone);

    return {
      ...baseResponse,
      service: appointment.service
        ? {
            id: appointment.service.id,
            name: appointment.service.name,
            description: appointment.service.description,
            price: appointment.service.price,
            duration_minutes: appointment.service.duration_minutes,
            category: appointment.service.category,
            image_url: appointment.service.image_url,
          }
        : {
            id: appointment.service_id,
            name: "",
            description: null,
            price: 0,
            duration_minutes: 0,
            category: "",
            image_url: null,
          },
      provider: appointment.provider
        ? {
            id: appointment.provider.id,
            business_name: appointment.provider.business_name,
            description: appointment.provider.description,
            business_type: appointment.provider.business_type,
            address: appointment.provider.address,
            city: appointment.provider.city,
            country: appointment.provider.country,
            average_rating: appointment.provider.average_rating,
          }
        : {
            id: appointment.provider_id,
            business_name: "",
            description: null,
            business_type: null,
            address: null,
            city: null,
            country: null,
            average_rating: null,
          },
      employee: appointment.employee
        ? {
            id: appointment.employee.id,
            name: appointment.employee.name,
            email: appointment.employee.email,
            phone: appointment.employee.phone,
            specialty: appointment.employee.specialty,
            photo_url: appointment.employee.photo_url,
            rating: appointment.employee.rating,
          }
        : null,
      client: appointment.client
        ? {
            id: appointment.client.id,
            name: appointment.client.name,
            apellido: appointment.client.apellido,
            email: appointment.client.email,
            phone: appointment.client.phone,
            avatar_url: appointment.client.avatar_url,
          }
        : null,
    };
  }
}
