import { Request, Response, NextFunction } from "express";
import {
  ProviderService,
  CreateProviderDTO,
  UpdateProviderDTO,
} from "../services/ProviderService";
import { AuthError } from "../utils/errors";

export class ProviderController {
  private _providerService: ProviderService;

  constructor() {
    this._providerService = new ProviderService();
  }

  async createProvider(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AuthError("Usuario no autenticado");
      }

      const dto: CreateProviderDTO = req.body;
      const provider = await this._providerService.createProvider(userId, dto);

      res.success(provider, "Proveedor creado exitosamente", 201);
    } catch (error) {
      next(error);
    }
  }

  async getAllProviders(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await this._providerService.getAllProviders(limit, offset);

      res.success(result, "Proveedores obtenidos", 200);
    } catch (error) {
      next(error);
    }
  }

  async getProviderById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const providerId = parseInt(req.params.id);

      const provider = await this._providerService.getProviderById(providerId);

      res.success(provider, "Proveedor obtenido", 200);
    } catch (error) {
      next(error);
    }
  }

  async updateProvider(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const providerId = parseInt(req.params.id);
      const dto: UpdateProviderDTO = req.body;

      const provider = await this._providerService.updateProvider(
        providerId,
        dto
      );

      res.success(provider, "Proveedor actualizado", 200);
    } catch (error) {
      next(error);
    }
  }

  async deleteProvider(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const providerId = parseInt(req.params.id);

      const result = await this._providerService.deleteProvider(providerId);

      res.success(result, result.message, 200);
    } catch (error) {
      next(error);
    }
  }
}
