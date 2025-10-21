import { Request, Response, NextFunction } from "express";
import {
  BlockedHoursService,
  CreateBlockedHoursDTO,
  UpdateBlockedHoursDTO,
} from "../services/BlockedHoursService";
import Users from "../models/Users";

export class BlockedHoursController {
  private _blockedHoursService: BlockedHoursService;

  constructor() {
    this._blockedHoursService = new BlockedHoursService();
  }

  /**
   * POST /blocked-hours
   * Crear nuevo horario bloqueado
   */
  async createBlockedHours(
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

      const user = await Users.findByPk(userId);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const dto: CreateBlockedHoursDTO = req.body;

      if (!dto.start_date || !dto.end_date || !dto.reason) {
        res.status(400).json({
          error: "Missing required fields: start_date, end_date, reason",
        });
        return;
      }

      const blockedHours = await this._blockedHoursService.createBlockedHours(
        dto,
        user.timezone
      );

      res.success(blockedHours, "Horario bloqueado creado exitosamente", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /blocked-hours/provider/:provider_id
   * Obtener horarios bloqueados de un proveedor
   */
  async getProviderBlockedHours(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const providerId = parseInt(req.params.provider_id);
      if (isNaN(providerId)) {
        res.status(400).json({ error: "Invalid provider ID" });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (limit > 100) {
        res.status(400).json({ error: "Limit cannot exceed 100" });
        return;
      }

      const provider = await Users.findByPk(providerId);
      const timezone = provider?.timezone || "America/Mexico_City";

      const result = await this._blockedHoursService.getProviderBlockedHours(
        providerId,
        page,
        limit,
        timezone
      );

      res.success(
        {
          blockedHours: result.blockedHours,
          pagination: {
            page,
            limit,
            total: result.total,
            pages: Math.ceil(result.total / limit),
          },
        },
        "Horarios bloqueados del proveedor obtenidos exitosamente",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /blocked-hours/employee/:employee_id
   * Obtener horarios bloqueados de un empleado
   */
  async getEmployeeBlockedHours(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const employeeId = parseInt(req.params.employee_id);
      if (isNaN(employeeId)) {
        res.status(400).json({ error: "Invalid employee ID" });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (limit > 100) {
        res.status(400).json({ error: "Limit cannot exceed 100" });
        return;
      }

      const userId = req.user?.id;
      const user = userId ? await Users.findByPk(userId) : null;
      const timezone = user?.timezone || "America/Mexico_City";

      const result = await this._blockedHoursService.getEmployeeBlockedHours(
        employeeId,
        page,
        limit,
        timezone
      );

      res.success(
        {
          blockedHours: result.blockedHours,
          pagination: {
            page,
            limit,
            total: result.total,
            pages: Math.ceil(result.total / limit),
          },
        },
        "Horarios bloqueados del empleado obtenidos exitosamente",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /blocked-hours/:id
   * Obtener horario bloqueado por ID
   */
  async getBlockedHoursById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const blockedHoursId = parseInt(req.params.id);
      if (isNaN(blockedHoursId)) {
        res.status(400).json({ error: "Invalid blocked hours ID" });
        return;
      }

      const userId = req.user?.id;
      const user = userId ? await Users.findByPk(userId) : null;
      const timezone = user?.timezone || "America/Mexico_City";

      const blockedHours = await this._blockedHoursService.getBlockedHoursById(
        blockedHoursId,
        timezone
      );

      res.success(blockedHours, "Horario bloqueado obtenido exitosamente", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /blocked-hours/date-range/search
   * Obtener horarios bloqueados en un rango de fechas
   */
  async getBlockedHoursByDateRange(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { provider_id, start_date, end_date } = req.query;

      if (!provider_id || !start_date || !end_date) {
        res.status(400).json({
          error: "Missing query parameters: provider_id, start_date, end_date",
        });
        return;
      }

      const providerId = parseInt(provider_id as string);
      if (isNaN(providerId)) {
        res.status(400).json({ error: "Invalid provider ID" });
        return;
      }

      const userId = req.user?.id;
      const user = userId ? await Users.findByPk(userId) : null;
      const timezone = user?.timezone || "America/Mexico_City";

      const blockedHours =
        await this._blockedHoursService.getBlockedHoursByDateRange(
          providerId,
          start_date as string,
          end_date as string,
          timezone
        );

      res.success(
        {
          blockedHours,
          count: blockedHours.length,
        },
        "Horarios bloqueados en rango de fechas obtenidos exitosamente",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /blocked-hours/:id
   * Actualizar horario bloqueado
   */
  async updateBlockedHours(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const blockedHoursId = parseInt(req.params.id);
      if (isNaN(blockedHoursId)) {
        res.status(400).json({ error: "Invalid blocked hours ID" });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const user = await Users.findByPk(userId);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const dto: UpdateBlockedHoursDTO = req.body;

      const blockedHours = await this._blockedHoursService.updateBlockedHours(
        blockedHoursId,
        dto,
        user.timezone
      );

      res.success(
        blockedHours,
        "Horario bloqueado actualizado exitosamente",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /blocked-hours/:id
   * Eliminar horario bloqueado
   */
  async deleteBlockedHours(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const blockedHoursId = parseInt(req.params.id);
      if (isNaN(blockedHoursId)) {
        res.status(400).json({ error: "Invalid blocked hours ID" });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      await this._blockedHoursService.deleteBlockedHours(blockedHoursId);

      res.success(
        { message: "Horario bloqueado eliminado exitosamente" },
        "Horario bloqueado eliminado",
        200
      );
    } catch (error) {
      next(error);
    }
  }
}
