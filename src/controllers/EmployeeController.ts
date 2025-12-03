import { Request, Response, NextFunction } from "express";
import {
  EmployeeService,
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
} from "../services/EmployeeService";
import { AuthError } from "../utils/errors";

export class EmployeeController {
  private _employeeService: EmployeeService;

  constructor() {
    this._employeeService = new EmployeeService();
  }

  async createEmployee(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AuthError("Usuario no autenticado");
      }

      const dto: CreateEmployeeDTO = req.body;
      const employee = await this._employeeService.createEmployee(dto);

      res.success(employee, "Empleado creado exitosamente", 201);
    } catch (error) {
      next(error);
    }
  }

  async getAllEmployees(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      const providerId = req.query.provider_id
        ? parseInt(req.query.provider_id as string)
        : undefined;

      const result = await this._employeeService.getAllEmployees(limit, offset, {
        provider_id: providerId,
      });

      res.success(result, "Empleados obtenidos", 200);
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const employeeId = parseInt(req.params.id);

      const employee = await this._employeeService.getEmployeeById(employeeId);

      res.success(employee, "Empleado obtenido", 200);
    } catch (error) {
      next(error);
    }
  }

  async getEmployeesByProvider(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const providerId = parseInt(req.params.provider_id);
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await this._employeeService.getEmployeesByProvider(
        providerId,
        limit,
        offset
      );

      res.success(result, "Empleados del proveedor obtenidos", 200);
    } catch (error) {
      next(error);
    }
  }

  async updateEmployee(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const employeeId = parseInt(req.params.id);
      const dto: UpdateEmployeeDTO = req.body;

      const employee = await this._employeeService.updateEmployee(
        employeeId,
        dto
      );

      res.success(employee, "Empleado actualizado", 200);
    } catch (error) {
      next(error);
    }
  }

  async deleteEmployee(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const employeeId = parseInt(req.params.id);

      const result = await this._employeeService.deleteEmployee(employeeId);

      res.success(result, result.message, 200);
    } catch (error) {
      next(error);
    }
  }
}

