import Employees from "../models/Employees";
import Providers from "../models/Providers";
import { NotFoundError, AppError, ConflictError } from "../utils/errors";
import { Op } from "sequelize";

export interface CreateEmployeeDTO {
  provider_id: number;
  name: string;
  email: string;
  phone?: string;
  specialty?: string;
  photo_url?: string;
}

export interface UpdateEmployeeDTO {
  name?: string;
  email?: string;
  phone?: string;
  specialty?: string;
  photo_url?: string;
}

export class EmployeeService {
  async createEmployee(dto: CreateEmployeeDTO) {
    try {
      // Verificar que el proveedor existe
      const provider = await Providers.findByPk(dto.provider_id);
      if (!provider) {
        throw new NotFoundError("Proveedor no encontrado");
      }

      // Verificar que no exista un empleado con el mismo email para este proveedor
      const existingEmployee = await Employees.findOne({
        where: {
          email: dto.email,
          provider_id: dto.provider_id,
        },
      });

      if (existingEmployee) {
        throw new ConflictError(
          "Ya existe un empleado con este email para este proveedor"
        );
      }

      const employee = await Employees.create({
        provider_id: dto.provider_id,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        specialty: dto.specialty,
        photo_url: dto.photo_url,
      });

      return employee;
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof ConflictError
      ) {
        throw error;
      }
      throw new AppError("Error al crear empleado", 500);
    }
  }

  async getAllEmployees(
    limit: number = 10,
    offset: number = 0,
    filters?: {
      provider_id?: number;
    }
  ) {
    try {
      const whereClause: any = {};

      if (filters?.provider_id) {
        whereClause.provider_id = filters.provider_id;
      }

      const { count, rows } = await Employees.findAndCountAll({
        where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
        limit,
        offset,
        include: [
          {
            model: Providers,
            attributes: ["id", "business_name", "business_type"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return {
        total: count,
        count: rows.length,
        data: rows,
      };
    } catch (error) {
      throw new AppError("Error al obtener empleados", 500);
    }
  }

  async getEmployeeById(employeeId: number) {
    try {
      const employee = await Employees.findByPk(employeeId, {
        include: [
          {
            model: Providers,
            attributes: ["id", "business_name", "business_type", "address"],
          },
        ],
      });

      if (!employee) {
        throw new NotFoundError("Empleado no encontrado");
      }

      return employee;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new AppError("Error al obtener empleado", 500);
    }
  }

  async getEmployeesByProvider(
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

      const { count, rows } = await Employees.findAndCountAll({
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
      throw new AppError("Error al obtener empleados del proveedor", 500);
    }
  }

  async updateEmployee(employeeId: number, dto: UpdateEmployeeDTO) {
    try {
      const employee = await Employees.findByPk(employeeId);

      if (!employee) {
        throw new NotFoundError("Empleado no encontrado");
      }

      // Si se actualiza el email, verificar que no exista otro empleado con el mismo email
      if (dto.email && dto.email !== employee.email) {
        const existingEmployee = await Employees.findOne({
          where: {
            email: dto.email,
            provider_id: employee.provider_id,
            id: { [Op.ne]: employeeId },
          },
        });

        if (existingEmployee) {
          throw new ConflictError(
            "Ya existe otro empleado con este email para este proveedor"
          );
        }
      }

      await employee.update(dto);

      return employee;
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof ConflictError
      ) {
        throw error;
      }
      throw new AppError("Error al actualizar empleado", 500);
    }
  }

  async deleteEmployee(employeeId: number) {
    try {
      const employee = await Employees.findByPk(employeeId);

      if (!employee) {
        throw new NotFoundError("Empleado no encontrado");
      }

      await employee.destroy();

      return { message: "Empleado eliminado exitosamente" };
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new AppError("Error al eliminar empleado", 500);
    }
  }
}

