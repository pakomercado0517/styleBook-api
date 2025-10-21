import { Request, Response, NextFunction } from "express";
import {
  AppointmentService,
  CreateAppointmentDTO,
  UpdateAppointmentDTO,
} from "../services/AppointmentService";

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

      if (limit > 100) {
        res.status(400).json({ error: "Limit cannot exceed 100" });
        return;
      }

      const result = await this._appointmentService.getClientAppointments(
        clientId,
        page,
        limit
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
      const providerId = req.user?.id;

      if (isNaN(appointmentId)) {
        res.status(400).json({ error: "Invalid appointment ID" });
        return;
      }

      if (!providerId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

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
      const providerId = req.user?.id;

      if (!providerId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      if (limit > 100) {
        res.status(400).json({ error: "Limit cannot exceed 100" });
        return;
      }

      const result =
        await this._appointmentService.getProviderPendingAppointments(
          providerId,
          limit,
          offset
        );

      res.success(result, "Citas pendientes obtenidas exitosamente", 200);
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
      const providerId = req.user?.id;

      if (!providerId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const status = (req.query.status as string) || undefined;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      if (limit > 100) {
        res.status(400).json({ error: "Limit cannot exceed 100" });
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
        offset
      );

      res.success(result, "Citas del proveedor obtenidas exitosamente", 200);
    } catch (error) {
      next(error);
    }
  }
}
