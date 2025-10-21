import { Request, Response, NextFunction } from "express";
import {
  ServiceService,
  CreateServiceDTO,
  UpdateServiceDTO,
} from "../services/ServiceService";

export class ServiceController {
  private _serviceService: ServiceService;

  constructor() {
    this._serviceService = new ServiceService();
  }

  async createService(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const providerId = parseInt(req.params.providerId);
      const dto: CreateServiceDTO = req.body;

      const service = await this._serviceService.createService(providerId, dto);

      res.success(service, "Servicio creado exitosamente", 201);
    } catch (error) {
      next(error);
    }
  }

  async getAllServices(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await this._serviceService.getAllServices(limit, offset);

      res.success(result, "Servicios obtenidos", 200);
    } catch (error) {
      next(error);
    }
  }

  async getServiceById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const serviceId = parseInt(req.params.id);

      const service = await this._serviceService.getServiceById(serviceId);

      res.success(service, "Servicio obtenido", 200);
    } catch (error) {
      next(error);
    }
  }

  async getServicesByProvider(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const providerId = parseInt(req.params.providerId);
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await this._serviceService.getServicesByProvider(
        providerId,
        limit,
        offset
      );

      res.success(result, "Servicios del proveedor obtenidos", 200);
    } catch (error) {
      next(error);
    }
  }

  async updateService(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const serviceId = parseInt(req.params.id);
      const dto: UpdateServiceDTO = req.body;

      const service = await this._serviceService.updateService(serviceId, dto);

      res.success(service, "Servicio actualizado", 200);
    } catch (error) {
      next(error);
    }
  }

  async deleteService(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const serviceId = parseInt(req.params.id);

      const result = await this._serviceService.deleteService(serviceId);

      res.success(result, result.message, 200);
    } catch (error) {
      next(error);
    }
  }
}
