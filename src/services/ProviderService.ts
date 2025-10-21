import Providers from "../models/Providers";
import Users from "../models/Users";
import { NotFoundError, AppError, ConflictError } from "../utils/errors";

export interface CreateProviderDTO {
  business_name: string;
  business_type?: string;
  description?: string;
  opening_time?: string;
  closing_time?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface UpdateProviderDTO {
  business_name?: string;
  business_type?: string;
  description?: string;
  opening_time?: string;
  closing_time?: string;
  address?: string;
  city?: string;
  country?: string;
}

export class ProviderService {
  async createProvider(userId: number, dto: CreateProviderDTO) {
    try {
      // Verificar que el usuario existe
      const user = await Users.findByPk(userId);
      if (!user) {
        throw new NotFoundError("Usuario no encontrado");
      }

      // Verificar que el usuario no es ya provider
      const existingProvider = await Providers.findOne({
        where: { user_id: userId },
      });
      if (existingProvider) {
        throw new ConflictError("El usuario ya tiene un perfil de proveedor");
      }

      const provider = await Providers.create({
        user_id: userId,
        business_name: dto.business_name,
        business_type: dto.business_type,
        description: dto.description,
        opening_time: dto.opening_time,
        closing_time: dto.closing_time,
        address: dto.address,
        city: dto.city,
        country: dto.country,
      });

      return provider;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError)
        throw error;
      throw new AppError("Error al crear proveedor", 500);
    }
  }

  async getAllProviders(limit: number = 10, offset: number = 0) {
    try {
      const { count, rows } = await Providers.findAndCountAll({
        limit,
        offset,
        include: [{ model: Users, attributes: ["id", "name", "email"] }],
        order: [["createdAt", "DESC"]],
      });

      return {
        total: count,
        count: rows.length,
        data: rows,
      };
    } catch (error) {
      throw new AppError("Error al obtener proveedores", 500);
    }
  }

  async getProviderById(providerId: number) {
    try {
      const provider = await Providers.findByPk(providerId, {
        include: [{ model: Users, attributes: ["id", "name", "email"] }],
      });

      if (!provider) {
        throw new NotFoundError("Proveedor no encontrado");
      }

      return provider;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new AppError("Error al obtener proveedor", 500);
    }
  }

  async updateProvider(providerId: number, dto: UpdateProviderDTO) {
    try {
      const provider = await Providers.findByPk(providerId);

      if (!provider) {
        throw new NotFoundError("Proveedor no encontrado");
      }

      await provider.update(dto);

      return provider;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new AppError("Error al actualizar proveedor", 500);
    }
  }

  async deleteProvider(providerId: number) {
    try {
      const provider = await Providers.findByPk(providerId);

      if (!provider) {
        throw new NotFoundError("Proveedor no encontrado");
      }

      await provider.destroy();

      return { message: "Proveedor eliminado exitosamente" };
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new AppError("Error al eliminar proveedor", 500);
    }
  }
}
