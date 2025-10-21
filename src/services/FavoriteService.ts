import Favorites from "../models/Favorites";
import Providers from "../models/Providers";
import Services from "../models/Services";
import Users from "../models/Users";
import { AppError } from "../utils/errors";
import { Op } from "sequelize";

export interface FavoriteResponse {
  id: number;
  client_id: number;
  provider_id: number | null;
  service_id: number | null;
  provider?: {
    id: number;
    business_name: string;
    business_type: string;
    city: string;
    average_rating: number | null;
  };
  service?: {
    id: number;
    name: string;
    price: number;
    provider_id: number;
  };
  createdAt: Date;
}

/**
 * FavoriteService
 * Gestiona los favoritos del cliente (proveedores y servicios)
 */
export class FavoriteService {
  /**
   * Agregar proveedor a favoritos
   */
  async addProviderToFavorites(
    clientId: number,
    providerId: number
  ): Promise<FavoriteResponse> {
    // 1. Validar que el proveedor exista
    const provider = await Providers.findByPk(providerId);
    if (!provider) {
      throw new AppError(`Proveedor ${providerId} no encontrado`, 404);
    }

    // 2. Verificar que no esté ya en favoritos
    const existing = await Favorites.findOne({
      where: {
        client_id: clientId,
        provider_id: providerId,
        service_id: null,
      },
    });

    if (existing) {
      throw new AppError("Este proveedor ya está en tus favoritos", 409);
    }

    // 3. Crear favorito
    const favorite = await Favorites.create({
      client_id: clientId,
      provider_id: providerId,
      service_id: null,
    });

    return this._mapToResponse(favorite);
  }

  /**
   * Agregar servicio a favoritos
   */
  async addServiceToFavorites(
    clientId: number,
    serviceId: number
  ): Promise<FavoriteResponse> {
    // 1. Validar que el servicio exista
    const service = await Services.findByPk(serviceId);
    if (!service) {
      throw new AppError(`Servicio ${serviceId} no encontrado`, 404);
    }

    // 2. Verificar que no esté ya en favoritos
    const existing = await Favorites.findOne({
      where: {
        client_id: clientId,
        service_id: serviceId,
        provider_id: null,
      },
    });

    if (existing) {
      throw new AppError("Este servicio ya está en tus favoritos", 409);
    }

    // 3. Crear favorito
    const favorite = await Favorites.create({
      client_id: clientId,
      provider_id: null,
      service_id: serviceId,
    });

    return this._mapToResponse(favorite);
  }

  /**
   * Obtener todos los favoritos del cliente
   */
  async getClientFavorites(
    clientId: number,
    limit: number = 20,
    offset: number = 0
  ): Promise<{
    favorites: FavoriteResponse[];
    total: number;
    provider_favorites: number;
    service_favorites: number;
  }> {
    // 1. Obtener favoritos
    const { count, rows } = await Favorites.findAndCountAll({
      where: { client_id: clientId },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    // 2. Mapear respuestas
    const favorites = await Promise.all(
      rows.map((fav) => this._mapToResponse(fav))
    );

    // 3. Contar por tipo
    const providerCount = rows.filter((f) => f.provider_id).length;
    const serviceCount = rows.filter((f) => f.service_id).length;

    return {
      favorites,
      total: count,
      provider_favorites: providerCount,
      service_favorites: serviceCount,
    };
  }

  /**
   * Obtener proveedores favoritos del cliente
   */
  async getClientFavoriteProviders(
    clientId: number,
    limit: number = 20,
    offset: number = 0
  ): Promise<{
    providers: FavoriteResponse[];
    total: number;
  }> {
    const { count, rows } = await Favorites.findAndCountAll({
      where: {
        client_id: clientId,
        provider_id: { [Op.not]: null },
      },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const providers = await Promise.all(
      rows.map((fav) => this._mapToResponse(fav))
    );

    return {
      providers,
      total: count,
    };
  }

  /**
   * Obtener servicios favoritos del cliente
   */
  async getClientFavoriteServices(
    clientId: number,
    limit: number = 20,
    offset: number = 0
  ): Promise<{
    services: FavoriteResponse[];
    total: number;
  }> {
    const { count, rows } = await Favorites.findAndCountAll({
      where: {
        client_id: clientId,
        service_id: { [Op.not]: null },
      },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const services = await Promise.all(
      rows.map((fav) => this._mapToResponse(fav))
    );

    return {
      services,
      total: count,
    };
  }

  /**
   * Verificar si un proveedor está en favoritos
   */
  async isProviderFavorite(
    clientId: number,
    providerId: number
  ): Promise<boolean> {
    const favorite = await Favorites.findOne({
      where: {
        client_id: clientId,
        provider_id: providerId,
        service_id: null,
      },
    });

    return !!favorite;
  }

  /**
   * Verificar si un servicio está en favoritos
   */
  async isServiceFavorite(
    clientId: number,
    serviceId: number
  ): Promise<boolean> {
    const favorite = await Favorites.findOne({
      where: {
        client_id: clientId,
        service_id: serviceId,
        provider_id: null,
      },
    });

    return !!favorite;
  }

  /**
   * Eliminar favorito (proveedor o servicio)
   */
  async removeFavorite(clientId: number, favoriteId: number): Promise<void> {
    const favorite = await Favorites.findByPk(favoriteId);

    if (!favorite) {
      throw new AppError(`Favorito ${favoriteId} no encontrado`, 404);
    }

    if (favorite.client_id !== clientId) {
      throw new AppError("No tienes permisos para eliminar este favorito", 403);
    }

    await favorite.destroy();
  }

  /**
   * Eliminar proveedor de favoritos
   */
  async removeProviderFromFavorites(
    clientId: number,
    providerId: number
  ): Promise<void> {
    const favorite = await Favorites.findOne({
      where: {
        client_id: clientId,
        provider_id: providerId,
        service_id: null,
      },
    });

    if (!favorite) {
      throw new AppError("Este proveedor no está en tus favoritos", 404);
    }

    await favorite.destroy();
  }

  /**
   * Eliminar servicio de favoritos
   */
  async removeServiceFromFavorites(
    clientId: number,
    serviceId: number
  ): Promise<void> {
    const favorite = await Favorites.findOne({
      where: {
        client_id: clientId,
        service_id: serviceId,
        provider_id: null,
      },
    });

    if (!favorite) {
      throw new AppError("Este servicio no está en tus favoritos", 404);
    }

    await favorite.destroy();
  }

  /**
   * Mapear modelo a respuesta
   */
  private async _mapToResponse(favorite: Favorites): Promise<FavoriteResponse> {
    const response: FavoriteResponse = {
      id: favorite.id,
      client_id: favorite.client_id,
      provider_id: favorite.provider_id,
      service_id: favorite.service_id,
      createdAt: favorite.createdAt,
    };

    // Incluir datos del proveedor si existe
    if (favorite.provider_id) {
      const provider = await Providers.findByPk(favorite.provider_id);
      if (provider) {
        response.provider = {
          id: provider.id,
          business_name: provider.business_name,
          business_type: provider.business_type || "",
          city: provider.city || "",
          average_rating: provider.average_rating,
        };
      }
    }

    // Incluir datos del servicio si existe
    if (favorite.service_id) {
      const service = await Services.findByPk(favorite.service_id);
      if (service) {
        response.service = {
          id: service.id,
          name: service.name,
          price: service.price,
          provider_id: service.provider_id,
        };
      }
    }

    return response;
  }
}
