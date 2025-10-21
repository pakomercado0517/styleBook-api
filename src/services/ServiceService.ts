import Services from "../models/Services";
import Providers from "../models/Providers";
import { NotFoundError, AppError } from "../utils/errors";

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
