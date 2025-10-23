import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Users from "../models/Users";
import {
  ValidationError,
  AuthError,
  ConflictError,
  NotFoundError,
} from "../utils/errors";

export interface RegisterDTO {
  name: string;
  apellido: string;
  email: string;
  password: string;
  role: "client" | "provider" | "admin";
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  token: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export class AuthService {
  private _jwtSecret = process.env.JWT_SECRET || "your-secret-key";

  async register(dto: RegisterDTO): Promise<AuthResponse> {
    // 1. Validar que el email no exista
    const existingUser = await Users.findOne({ where: { email: dto.email } });
    if (existingUser) {
      throw new ConflictError("El email ya está registrado");
    }

    // 2. Hash del password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Crear usuario
    const user = await Users.create({
      name: dto.name,
      apellido: dto.apellido,
      email: dto.email,
      password: hashedPassword,
      role: dto.role,
      is_active: true,
      timezone: "America/Mexico_City", // Default timezone
    });

    // 4. Generar token
    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async login(dto: LoginDTO): Promise<AuthResponse> {
    // 1. Buscar usuario por email
    const user = await Users.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new NotFoundError("Usuario no encontrado");
    }

    // 2. Verificar contraseña
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new AuthError("Email o contraseña incorrectos");
    }

    // 3. Verificar que el usuario esté activo
    if (!user.is_active) {
      throw new AuthError("Usuario desactivado");
    }

    // 4. Generar token
    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async changePassword(
    userId: number,
    dto: ChangePasswordDTO
  ): Promise<{ message: string }> {
    // 1. Buscar usuario
    const user = await Users.findByPk(userId);
    if (!user) {
      throw new NotFoundError("Usuario no encontrado");
    }

    // 2. Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      throw new AuthError("La contraseña actual es incorrecta");
    }

    // 3. Validar que la nueva contraseña sea diferente
    const isSamePassword = await bcrypt.compare(dto.newPassword, user.password);
    if (isSamePassword) {
      throw new ValidationError(
        "La nueva contraseña debe ser diferente a la actual"
      );
    }

    // 4. Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    // 5. Actualizar contraseña
    await user.update({ password: hashedPassword });

    return {
      message: "Contraseña actualizada exitosamente",
    };
  }

  generateToken(userId: number, email: string, role: string): string {
    return jwt.sign(
      {
        id: userId,
        email,
        role,
      },
      this._jwtSecret,
      { expiresIn: 86400 } // 1 day in seconds
    );
  }
}
