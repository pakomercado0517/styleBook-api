import { Request, Response, NextFunction } from "express";
import {
  AvailabilityService,
  AvailabilityDTO,
} from "../services/AvailabilityService";

export class AvailabilityController {
  private _availabilityService: AvailabilityService;

  constructor() {
    this._availabilityService = new AvailabilityService();
  }

  /**
   * GET /availability/employee/:id
   * Obtener disponibilidad de un empleado para una fecha y servicio específico
   */
  async getEmployeeAvailability(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { service_id, date, timezone } = req.query;

      // Validar parámetros
      if (!id || !service_id || !date || !timezone) {
        res.status(400).json({
          success: false,
          message:
            "Faltan parámetros requeridos: id, service_id, date, timezone",
        });
        return;
      }

      const dto: AvailabilityDTO = {
        employee_id: parseInt(id as string),
        service_id: parseInt(service_id as string),
        date: date as string,
        timezone: timezone as string,
      };

      const result =
        await this._availabilityService.getEmployeeAvailability(dto);

      res.success(result, "Disponibilidad obtenida exitosamente", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /availability/provider/:id
   * Obtener disponibilidad de todos los empleados de un proveedor
   */
  async getProvidersEmployeesAvailability(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { service_id, date, timezone } = req.query;

      // Validar parámetros
      if (!id || !service_id || !date || !timezone) {
        res.status(400).json({
          success: false,
          message:
            "Faltan parámetros requeridos: id, service_id, date, timezone",
        });
        return;
      }

      const result = await this._availabilityService.getEmployeesAvailability(
        parseInt(id as string),
        {
          service_id: parseInt(service_id as string),
          date: date as string,
          timezone: timezone as string,
        }
      );

      res.success(result, "Disponibilidad de empleados obtenida", 200);
    } catch (error) {
      next(error);
    }
  }
}
