import { Request, Response, NextFunction } from "express";
import {
  AppointmentService,
  CreateAppointmentDTO,
  UpdateAppointmentDTO,
  RescheduleAppointmentDTO,
} from "../services/AppointmentService";
import Providers from "../models/Providers";

export class AppointmentController {
  private _appointmentService: AppointmentService;

  constructor() {
    this._appointmentService = new AppointmentService();
  }

  /**
   * POST /appointments
   * Crear una nueva cita
   */
  async createAppointment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const clientId = req.user?.id;
      if (!clientId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const dto: CreateAppointmentDTO = req.body;

      if (
        !dto.service_id ||
        !dto.employee_id ||
        !dto.start_date ||
        !dto.end_date
      ) {
        res.status(400).json({
          error:
            "Missing required fields: service_id, employee_id, start_date, end_date",
        });
        return;
      }

      const appointment = await this._appointmentService.createAppointment(
        clientId,
        dto
      );

      res.success(appointment, "Cita creada exitosamente", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /appointments
   * Obtener todas las citas del cliente autenticado
   */
  async getClientAppointments(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const clientId = req.user?.id;
      if (!clientId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const employeeId = req.query.employee_id
        ? parseInt(req.query.employee_id as string)
        : undefined;
      const pastDays = req.query.past
        ? parseInt(req.query.past as string)
        : undefined;
      const filter = req.query.filter as "upcoming" | undefined;

      if (limit > 100) {
        res.status(400).json({ error: "Limit cannot exceed 100" });
        return;
      }

      if (employeeId && isNaN(employeeId)) {
        res.status(400).json({ error: "Invalid employee_id" });
        return;
      }

      if (pastDays !== undefined && (isNaN(pastDays) || pastDays < 1)) {
        res.status(400).json({ error: "Past days must be a positive integer" });
        return;
      }

      if (filter && filter !== "upcoming") {
        res.status(400).json({ error: "Filter must be 'upcoming'" });
        return;
      }

      const result = await this._appointmentService.getClientAppointments(
        clientId,
        page,
        limit,
        employeeId,
        pastDays,
        filter
      );

      res.success(
        {
          appointments: result.appointments,
          pagination: {
            page,
            limit,
            total: result.total,
            pages: Math.ceil(result.total / limit),
          },
        },
        "Citas obtenidas exitosamente",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /appointments/:id
   * Obtener una cita específica por ID
   */
  async getAppointmentById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const appointmentId = parseInt(req.params.id);

      if (isNaN(appointmentId)) {
        res.status(400).json({ error: "Invalid appointment ID" });
        return;
      }

      const appointment =
        await this._appointmentService.getAppointmentById(appointmentId);

      res.success(appointment, "Cita obtenida exitosamente", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /appointments/:id
   * Actualizar estado o notas de una cita
   */
  async updateAppointment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const appointmentId = parseInt(req.params.id);

      if (isNaN(appointmentId)) {
        res.status(400).json({ error: "Invalid appointment ID" });
        return;
      }

      const dto: UpdateAppointmentDTO = req.body;

      const appointment = await this._appointmentService.updateAppointment(
        appointmentId,
        dto
      );

      res.success(appointment, "Cita actualizada exitosamente", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /appointments/:id
   * Cancelar una cita
   */
  async cancelAppointment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const appointmentId = parseInt(req.params.id);

      if (isNaN(appointmentId)) {
        res.status(400).json({ error: "Invalid appointment ID" });
        return;
      }

      const appointment =
        await this._appointmentService.cancelAppointment(appointmentId);

      res.success(appointment, "Cita cancelada exitosamente", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /appointments/:id/confirm
   * Confirmar una cita (solo proveedor)
   */
  async confirmAppointment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const appointmentId = parseInt(req.params.id);
      const userId = req.user?.id;

      if (isNaN(appointmentId)) {
        res.status(400).json({ error: "Invalid appointment ID" });
        return;
      }

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      // Obtener el provider_id desde el user_id
      const provider = await Providers.findOne({
        where: { user_id: userId },
      });

      if (!provider) {
        res.status(404).json({ error: "Proveedor no encontrado" });
        return;
      }

      const providerId = provider.id;

      const appointment = await this._appointmentService.confirmAppointment(
        appointmentId,
        providerId
      );

      res.success(appointment, "Cita confirmada exitosamente", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /appointments/provider/pending
   * Obtener citas pendientes de confirmación del proveedor autenticado
   */
  async getProviderPendingAppointments(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      // Obtener el provider_id desde el user_id
      const provider = await Providers.findOne({
        where: { user_id: userId },
      });

      if (!provider) {
        res.status(404).json({ error: "Proveedor no encontrado" });
        return;
      }

      const providerId = provider.id;

      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const employeeId = req.query.employee_id
        ? parseInt(req.query.employee_id as string)
        : undefined;

      if (limit > 100) {
        res.status(400).json({ error: "Limit cannot exceed 100" });
        return;
      }

      if (employeeId && isNaN(employeeId)) {
        res.status(400).json({ error: "Invalid employee_id" });
        return;
      }

      const result =
        await this._appointmentService.getProviderPendingAppointments(
          providerId,
          limit,
          offset,
          employeeId
        );

      res.success(result, "Citas pendientes obtenidas exitosamente", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /appointments/:id/reschedule
   * Reagendar una cita (cambiar fecha/hora y opcionalmente empleado)
   */
  async rescheduleAppointment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const appointmentId = parseInt(req.params.id);
      const userId = req.user?.id;

      if (isNaN(appointmentId)) {
        res.status(400).json({ error: "Invalid appointment ID" });
        return;
      }

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const dto: RescheduleAppointmentDTO = req.body;

      if (!dto.start_date || !dto.end_date) {
        res.status(400).json({
          error: "Missing required fields: start_date, end_date",
        });
        return;
      }

      const appointment = await this._appointmentService.rescheduleAppointment(
        appointmentId,
        userId,
        dto
      );

      res.success(appointment, "Cita reagendada exitosamente", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /appointments/provider/all
   * Obtener todas las citas del proveedor (con filtro opcional por estado)
   */
  async getProviderAppointments(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      // Obtener el provider_id desde el user_id
      const provider = await Providers.findOne({
        where: { user_id: userId },
      });

      if (!provider) {
        res.status(404).json({ error: "Proveedor no encontrado" });
        return;
      }

      const providerId = provider.id;

      const status = (req.query.status as string) || undefined;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const employeeId = req.query.employee_id
        ? parseInt(req.query.employee_id as string)
        : undefined;
      const startDate = req.query.start_date as string | undefined;
      const endDate = req.query.end_date as string | undefined;

      if (limit > 100) {
        res.status(400).json({ error: "Limit cannot exceed 100" });
        return;
      }

      if (employeeId && isNaN(employeeId)) {
        res.status(400).json({ error: "Invalid employee_id" });
        return;
      }

      // Validar status si se proporciona
      if (
        status &&
        !["pending", "confirmed", "completed", "cancelled", "no_show"].includes(
          status
        )
      ) {
        res.status(400).json({
          error:
            "Status must be one of: pending, confirmed, completed, cancelled, no_show",
        });
        return;
      }

      // Validar fechas si se proporcionan
      if (startDate) {
        const startDateParsed = new Date(startDate);
        if (isNaN(startDateParsed.getTime())) {
          res.status(400).json({ error: "Invalid start_date format. Use ISO 8601 format" });
          return;
        }
      }

      if (endDate) {
        const endDateParsed = new Date(endDate);
        if (isNaN(endDateParsed.getTime())) {
          res.status(400).json({ error: "Invalid end_date format. Use ISO 8601 format" });
          return;
        }
      }

      // Validar que start_date sea anterior a end_date
      if (startDate && endDate) {
        const startDateParsed = new Date(startDate);
        const endDateParsed = new Date(endDate);
        if (startDateParsed > endDateParsed) {
          res.status(400).json({ error: "start_date must be before or equal to end_date" });
          return;
        }
      }

      const result = await this._appointmentService.getProviderAppointments(
        providerId,
        status as
          | "pending"
          | "confirmed"
          | "completed"
          | "cancelled"
          | "no_show"
          | undefined,
        limit,
        offset,
        employeeId,
        startDate,
        endDate
      );

      res.success(
        {
          appointments: result.appointments,
          pagination: {
            page: Math.floor(offset / limit) + 1,
            limit,
            total: result.total,
            pages: Math.ceil(result.total / limit),
          },
        },
        "Citas del proveedor obtenidas exitosamente",
        200
      );
    } catch (error) {
      next(error);
    }
  }
}
