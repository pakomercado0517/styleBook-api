import { Request, Response, NextFunction } from "express";
import {
  ServiceService,
  CreateServiceDTO,
  UpdateServiceDTO,
  SearchServicesDTO,
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
      const category = req.query.category as
        | "corte"
        | "tinte"
        | "peinado"
        | "manicure"
        | "pedicure"
        | "tratamiento_capilar"
        | "barba"
        | "afeitado"
        | "masaje"
        | "facial"
        | "corporal"
        | "aromaterapia"
        | "limpieza_dental"
        | "estetica_dental"
        | "asesoria"
        | undefined;
      const provider_id = req.query.provider_id
        ? parseInt(req.query.provider_id as string)
        : undefined;
      const is_active =
        req.query.is_active !== undefined
          ? req.query.is_active === "true" || req.query.is_active === "1"
          : undefined;

      const filters = {
        ...(category && { category }),
        ...(provider_id && { provider_id }),
        ...(is_active !== undefined && { is_active }),
      };

      const result = await this._serviceService.getAllServices(
        limit,
        offset,
        Object.keys(filters).length > 0 ? filters : undefined
      );

      res.success(result, "Servicios obtenidos", 200);
    } catch (error) {
      next(error);
    }
  }

  async searchServices(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto: SearchServicesDTO = {
        search: req.query.search as string,
        price_min: req.query.price_min ? parseFloat(req.query.price_min as string) : undefined,
        price_max: req.query.price_max ? parseFloat(req.query.price_max as string) : undefined,
        provider_id: req.query.provider_id ? parseInt(req.query.provider_id as string) : undefined,
        category: req.query.category as SearchServicesDTO["category"],
        city: req.query.city as string,
        sort_by: (req.query.sort_by as SearchServicesDTO["sort_by"]) || "newest",
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };

      const result = await this._serviceService.searchServices(dto);

      res.success(result, "Búsqueda de servicios completada", 200);
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
