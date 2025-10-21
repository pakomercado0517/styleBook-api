import Users from "../models/Users";
import { NotFoundError, AppError } from "../utils/errors";

export interface UserUpdateDTO {
  name?: string;
  apellido?: string;
  phone?: string;
  avatar_url?: string;
  timezone?: string;
}

export class UserService {
  async getAllUsers(limit: number = 10, offset: number = 0) {
    try {
      const { count, rows } = await Users.findAndCountAll({
        limit,
        offset,
        attributes: { exclude: ["password"] },
        order: [["createdAt", "DESC"]],
      });

      return {
        total: count,
        count: rows.length,
        data: rows,
      };
    } catch (error) {
      throw new AppError("Error al obtener usuarios", 500);
    }
  }

  async getUserById(userId: number) {
    try {
      const user = await Users.findByPk(userId, {
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        throw new NotFoundError("Usuario no encontrado");
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new AppError("Error al obtener usuario", 500);
    }
  }

  async updateUser(userId: number, dto: UserUpdateDTO) {
    try {
      const user = await Users.findByPk(userId);

      if (!user) {
        throw new NotFoundError("Usuario no encontrado");
      }

      await user.update(dto);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        timezone: user.timezone,
      };
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new AppError("Error al actualizar usuario", 500);
    }
  }

  async deleteUser(userId: number) {
    try {
      const user = await Users.findByPk(userId);

      if (!user) {
        throw new NotFoundError("Usuario no encontrado");
      }

      await user.destroy();

      return { message: "Usuario eliminado exitosamente" };
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new AppError("Error al eliminar usuario", 500);
    }
  }
}
