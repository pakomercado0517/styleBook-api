import { Request, Response, NextFunction } from "express";
import { FavoriteService } from "../services/FavoriteService";

export class FavoriteController {
  private _favoriteService: FavoriteService;

  constructor() {
    this._favoriteService = new FavoriteService();
  }

  /**
   * POST /favorites/provider/:provider_id
   * Agregar proveedor a favoritos
   */
  async addProviderToFavorites(
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

      const providerId = parseInt(req.params.provider_id);
      if (isNaN(providerId)) {
        res.status(400).json({ error: "Invalid provider ID" });
        return;
      }

      const favorite = await this._favoriteService.addProviderToFavorites(
        clientId,
        providerId
      );

      res.success(favorite, "Proveedor agregado a favoritos", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /favorites/service/:service_id
   * Agregar servicio a favoritos
   */
  async addServiceToFavorites(
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

      const serviceId = parseInt(req.params.service_id);
      if (isNaN(serviceId)) {
        res.status(400).json({ error: "Invalid service ID" });
        return;
      }

      const favorite = await this._favoriteService.addServiceToFavorites(
        clientId,
        serviceId
      );

      res.success(favorite, "Servicio agregado a favoritos", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /favorites
   * Obtener todos los favoritos del cliente
   */
  async getClientFavorites(
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

      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      if (limit > 100) {
        res.status(400).json({ error: "Limit cannot exceed 100" });
        return;
      }

      const result = await this._favoriteService.getClientFavorites(
        clientId,
        limit,
        offset
      );

      res.success(result, "Favoritos obtenidos exitosamente", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /favorites/providers
   * Obtener proveedores favoritos del cliente
   */
  async getClientFavoriteProviders(
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

      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      if (limit > 100) {
        res.status(400).json({ error: "Limit cannot exceed 100" });
        return;
      }

      const result = await this._favoriteService.getClientFavoriteProviders(
        clientId,
        limit,
        offset
      );

      res.success(result, "Proveedores favoritos obtenidos", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /favorites/services
   * Obtener servicios favoritos del cliente
   */
  async getClientFavoriteServices(
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

      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      if (limit > 100) {
        res.status(400).json({ error: "Limit cannot exceed 100" });
        return;
      }

      const result = await this._favoriteService.getClientFavoriteServices(
        clientId,
        limit,
        offset
      );

      res.success(result, "Servicios favoritos obtenidos", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /favorites/provider/:provider_id/is-favorite
   * Verificar si un proveedor está en favoritos
   */
  async isProviderFavorite(
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

      const providerId = parseInt(req.params.provider_id);
      if (isNaN(providerId)) {
        res.status(400).json({ error: "Invalid provider ID" });
        return;
      }

      const isFavorite = await this._favoriteService.isProviderFavorite(
        clientId,
        providerId
      );

      res.success({ is_favorite: isFavorite }, "Verificación completada", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /favorites/service/:service_id/is-favorite
   * Verificar si un servicio está en favoritos
   */
  async isServiceFavorite(
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

      const serviceId = parseInt(req.params.service_id);
      if (isNaN(serviceId)) {
        res.status(400).json({ error: "Invalid service ID" });
        return;
      }

      const isFavorite = await this._favoriteService.isServiceFavorite(
        clientId,
        serviceId
      );

      res.success({ is_favorite: isFavorite }, "Verificación completada", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /favorites/:id
   * Eliminar un favorito por ID
   */
  async removeFavorite(
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

      const favoriteId = parseInt(req.params.id);
      if (isNaN(favoriteId)) {
        res.status(400).json({ error: "Invalid favorite ID" });
        return;
      }

      await this._favoriteService.removeFavorite(clientId, favoriteId);

      res.success(
        { message: "Favorito eliminado" },
        "Favorito eliminado exitosamente",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /favorites/provider/:provider_id
   * Eliminar proveedor de favoritos
   */
  async removeProviderFromFavorites(
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

      const providerId = parseInt(req.params.provider_id);
      if (isNaN(providerId)) {
        res.status(400).json({ error: "Invalid provider ID" });
        return;
      }

      await this._favoriteService.removeProviderFromFavorites(
        clientId,
        providerId
      );

      res.success(
        { message: "Proveedor eliminado de favoritos" },
        "Proveedor eliminado de favoritos exitosamente",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /favorites/service/:service_id
   * Eliminar servicio de favoritos
   */
  async removeServiceFromFavorites(
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

      const serviceId = parseInt(req.params.service_id);
      if (isNaN(serviceId)) {
        res.status(400).json({ error: "Invalid service ID" });
        return;
      }

      await this._favoriteService.removeServiceFromFavorites(
        clientId,
        serviceId
      );

      res.success(
        { message: "Servicio eliminado de favoritos" },
        "Servicio eliminado de favoritos exitosamente",
        200
      );
    } catch (error) {
      next(error);
    }
  }
}
