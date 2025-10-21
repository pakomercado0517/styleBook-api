import Services from "../models/Services";
import Providers from "../models/Providers";
import { NotFoundError, AppError } from "../utils/errors";
import { Op } from "sequelize";

export interface CreateServiceDTO {
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  image_url?: string;
}

export interface UpdateServiceDTO {
  name?: string;
  description?: string;
  duration_minutes?: number;
  price?: number;
  image_url?: string;
  is_active?: boolean;
}

export interface SearchServicesDTO {
  search?: string;
  price_min?: number;
  price_max?: number;
  provider_id?: number;
  city?: string;
  sort_by?: "price_asc" | "price_desc" | "name" | "rating" | "newest";
  limit?: number;
  offset?: number;
}

export class ServiceService {
  async createService(providerId: number, dto: CreateServiceDTO) {
    try {
      // Verificar que el proveedor existe
      const provider = await Providers.findByPk(providerId);
      if (!provider) {
        throw new NotFoundError("Proveedor no encontrado");
      }

      const service = await Services.create({
        provider_id: providerId,
        name: dto.name,
        description: dto.description,
        duration_minutes: dto.duration_minutes,
        price: dto.price,
        image_url: dto.image_url,
      });

      return service;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new AppError("Error al crear servicio", 500);
    }
  }

  async getAllServices(limit: number = 10, offset: number = 0) {
    try {
      const { count, rows } = await Services.findAndCountAll({
        limit,
        offset,
        include: [{ model: Providers, attributes: ["id", "business_name"] }],
        order: [["createdAt", "DESC"]],
      });

      return {
        total: count,
        count: rows.length,
        data: rows,
      };
    } catch (error) {
      throw new AppError("Error al obtener servicios", 500);
    }
  }

  async searchServices(dto: SearchServicesDTO) {
    try {
      const limit = dto.limit || 10;
      const offset = dto.offset || 0;
      const whereClause: any = { is_active: true };
      const providerWhereClause: any = { is_active: true };

      // Filtro por nombre o descripción
      if (dto.search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${dto.search}%` } },
          { description: { [Op.iLike]: `%${dto.search}%` } },
        ];
      }

      // Filtro por rango de precio
      if (dto.price_min !== undefined || dto.price_max !== undefined) {
        whereClause.price = {};
        if (dto.price_min !== undefined) {
          whereClause.price[Op.gte] = dto.price_min;
        }
        if (dto.price_max !== undefined) {
          whereClause.price[Op.lte] = dto.price_max;
        }
      }

      // Filtro por proveedor específico
      if (dto.provider_id) {
        whereClause.provider_id = dto.provider_id;
      }

      // Filtro por ciudad del proveedor
      if (dto.city) {
        providerWhereClause.city = { [Op.iLike]: `%${dto.city}%` };
      }

      // Determinar ordenamiento
      const orderBy: any[] = [];
      switch (dto.sort_by) {
        case "price_asc":
          orderBy.push(["price", "ASC"]);
          break;
        case "price_desc":
          orderBy.push(["price", "DESC"]);
          break;
        case "name":
          orderBy.push(["name", "ASC"]);
          break;
        case "rating":
          orderBy.push([Providers, "average_rating", "DESC"]);
          break;
        case "newest":
          orderBy.push(["createdAt", "DESC"]);
          break;
        default:
          orderBy.push(["createdAt", "DESC"]);
      }

      const { count, rows } = await Services.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Providers,
            attributes: [
              "id",
              "business_name",
              "business_type",
              "city",
              "address",
              "average_rating",
            ],
            where: Object.keys(providerWhereClause).length > 0 ? providerWhereClause : undefined,
          },
        ],
        limit,
        offset,
        order: orderBy,
        distinct: true,
      });

      return {
        total: count,
        count: rows.length,
        limit,
        offset,
        data: rows,
      };
    } catch (error) {
      throw new AppError("Error al buscar servicios", 500);
    }
  }

  async getServiceById(serviceId: number) {
    try {
      const service = await Services.findByPk(serviceId, {
        include: [
          { model: Providers, attributes: ["id", "business_name", "address"] },
        ],
      });

      if (!service) {
        throw new NotFoundError("Servicio no encontrado");
      }

      return service;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new AppError("Error al obtener servicio", 500);
    }
  }

  async getServicesByProvider(
    providerId: number,
    limit: number = 10,
    offset: number = 0
  ) {
    try {
      // Verificar que el proveedor existe
      const provider = await Providers.findByPk(providerId);
      if (!provider) {
        throw new NotFoundError("Proveedor no encontrado");
      }

      const { count, rows } = await Services.findAndCountAll({
        where: { provider_id: providerId },
        limit,
        offset,
        order: [["createdAt", "DESC"]],
      });

      return {
        total: count,
        count: rows.length,
        data: rows,
      };
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new AppError("Error al obtener servicios del proveedor", 500);
    }
  }

  async updateService(serviceId: number, dto: UpdateServiceDTO) {
    try {
      const service = await Services.findByPk(serviceId);

      if (!service) {
        throw new NotFoundError("Servicio no encontrado");
      }

      await service.update(dto);

      return service;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new AppError("Error al actualizar servicio", 500);
    }
  }

  async deleteService(serviceId: number) {
    try {
      const service = await Services.findByPk(serviceId);

      if (!service) {
        throw new NotFoundError("Servicio no encontrado");
      }

      await service.destroy();

      return { message: "Servicio eliminado exitosamente" };
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new AppError("Error al eliminar servicio", 500);
    }
  }
}
