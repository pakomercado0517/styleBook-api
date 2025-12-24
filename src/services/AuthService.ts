import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import Users from "../models/Users";
import RefreshTokens from "../models/RefreshTokens";
import {
  ValidationError,
  AuthError,
  ConflictError,
  NotFoundError,
} from "../utils/errors";
import emailService from "./EmailService";
import { Op } from "sequelize";

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
  refreshToken: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface VerifyEmailResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    verified: boolean;
  };
}

export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
}

export class AuthService {
  private _jwtSecret = process.env.JWT_SECRET || "your-secret-key";
  private _jwtRefreshSecret =
    process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key";
  private _accessTokenExpirationMinutes = 30; // 30 minutos
  private _refreshTokenExpirationDays = 7; // 7 días
  private _resetTokenExpirationHours = 1; // Token de reset expira en 1 hora

  /**
   * Genera un token de verificación seguro
   */
  private _generateVerificationToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Calcula la fecha de expiración del token de verificación (24 horas)
   */
  private _getVerificationTokenExpiration(): Date {
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 24);
    return expiration;
  }

  /**
   * Calcula la fecha de expiración del token de reset (1 hora)
   */
  private _getResetTokenExpiration(): Date {
    const expiration = new Date();
    expiration.setHours(
      expiration.getHours() + this._resetTokenExpirationHours
    );
    return expiration;
  }

  /**
   * Calcula la fecha de expiración del refresh token (7 días)
   */
  private _getRefreshTokenExpiration(): Date {
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + this._refreshTokenExpirationDays);
    return expiration;
  }

  /**
   * Genera un refresh token JWT
   */
  private _generateRefreshToken(userId: number): string {
    return jwt.sign({ id: userId }, this._jwtRefreshSecret, {
      expiresIn: `${this._refreshTokenExpirationDays}d`,
    });
  }

  /**
   * Guarda el refresh token en la base de datos
   */
  private async _saveRefreshToken(
    userId: number,
    token: string,
    deviceInfo?: string,
    ipAddress?: string
  ): Promise<RefreshTokens> {
    return await RefreshTokens.create({
      user_id: userId,
      token,
      expires_at: this._getRefreshTokenExpiration(),
      is_revoked: false,
      device_info: deviceInfo || null,
      ip_address: ipAddress || null,
    });
  }

  async register(dto: RegisterDTO): Promise<AuthResponse> {
    // 1. Validar que el email no exista
    const existingUser = await Users.findOne({ where: { email: dto.email } });
    if (existingUser) {
      throw new ConflictError("El email ya está registrado");
    }

    // 2. Hash del password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Generar token de verificación
    const verificationToken = this._generateVerificationToken();
    const tokenExpiration = this._getVerificationTokenExpiration();

    // 4. Crear usuario (sin verificar)
    const user = await Users.create({
      name: dto.name,
      apellido: dto.apellido,
      email: dto.email,
      password: hashedPassword,
      role: dto.role,
      is_active: true,
      timezone: "America/Mexico_City",
      email_verified_at: null,
      verification_token: verificationToken,
      verification_token_expires: tokenExpiration,
    });

    // 5. Enviar email de verificación
    try {
      await emailService.sendVerificationEmail({
        toEmail: user.email,
        userName: user.name,
        verificationToken: verificationToken,
      });
    } catch (error) {
      console.error("Error al enviar email de verificación:", error);
      // No lanzamos error aquí para no bloquear el registro
      // El usuario puede reenviar el email después
    }

    // 6. Generar access token y refresh token
    const token = this.generateToken(user.id, user.email, user.role);
    const refreshToken = this._generateRefreshToken(user.id);

    // 7. Guardar refresh token en BD
    await this._saveRefreshToken(user.id, refreshToken);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
      refreshToken,
    };
  }

  async login(dto: LoginDTO): Promise<AuthResponse> {
    // 1. Buscar usuario por email
    const user = await Users.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new AuthError("Email o contraseña incorrectos");
    }

    // 2. Verificar contraseña
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new AuthError("Email o contraseña incorrectos");
    }

    // 3. Verificar que el usuario esté activo
    if (!user.is_active) {
      throw new AuthError("Tu cuenta ha sido desactivada. Contacta al soporte");
    }

    // 4. Verificar que el email esté verificado
    if (!user.email_verified_at) {
      throw new AuthError(
        "Por favor verifica tu email antes de iniciar sesión. Revisa tu bandeja de entrada"
      );
    }

    // 5. Generar access token y refresh token
    const token = this.generateToken(user.id, user.email, user.role);
    const refreshToken = this._generateRefreshToken(user.id);

    // 6. Guardar refresh token en BD
    await this._saveRefreshToken(user.id, refreshToken);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
      refreshToken,
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

  /**
   * Verifica el email del usuario con el token
   */
  async verifyEmail(token: string): Promise<VerifyEmailResponse> {
    // 1. Buscar usuario por token
    const user = await Users.findOne({
      where: { verification_token: token },
    });

    if (!user) {
      throw new ValidationError("Token de verificación inválido");
    }

    // 2. Verificar si ya está verificado
    if (user.email_verified_at) {
      throw new ValidationError("Este email ya ha sido verificado");
    }

    // 3. Verificar si el token expiró
    if (
      user.verification_token_expires &&
      new Date() > user.verification_token_expires
    ) {
      throw new ValidationError(
        "El token de verificación ha expirado. Solicita uno nuevo"
      );
    }

    // 4. Marcar como verificado
    await user.update({
      email_verified_at: new Date(),
      verification_token: null,
      verification_token_expires: null,
    });

    return {
      message: "Email verificado exitosamente. Ya puedes iniciar sesión",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        verified: true,
      },
    };
  }

  /**
   * Reenvía el email de verificación
   */
  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    // 1. Buscar usuario por email
    const user = await Users.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundError("Usuario no encontrado");
    }

    // 2. Verificar si ya está verificado
    if (user.email_verified_at) {
      throw new ValidationError("Este email ya ha sido verificado");
    }

    // 3. Generar nuevo token
    const verificationToken = this._generateVerificationToken();
    const tokenExpiration = this._getVerificationTokenExpiration();

    // 4. Actualizar token en BD
    await user.update({
      verification_token: verificationToken,
      verification_token_expires: tokenExpiration,
    });

    // 5. Enviar email
    await emailService.sendVerificationEmail({
      toEmail: user.email,
      userName: user.name,
      verificationToken: verificationToken,
    });

    return {
      message: "Email de verificación enviado. Revisa tu bandeja de entrada",
    };
  }

  /**
   * Solicita recuperación de contraseña
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    // 1. Buscar usuario por email
    const user = await Users.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundError("Usuario no encontrado");
    }

    // 2. Generar token de reset
    const resetToken = this._generateVerificationToken();
    const tokenExpiration = this._getResetTokenExpiration();

    // 3. Guardar token en BD
    await user.update({
      reset_password_token: resetToken,
      reset_password_token_expires: tokenExpiration,
    });

    // 4. Enviar email con token
    await emailService.sendPasswordResetEmail({
      toEmail: user.email,
      userName: user.name,
      resetToken: resetToken,
    });

    return {
      message: "Email de recuperación enviado. Revisa tu bandeja de entrada",
    };
  }

  /**
   * Restablece la contraseña con el token
   */
  async resetPassword(dto: ResetPasswordDTO): Promise<{ message: string }> {
    // 1. Buscar usuario por token
    const user = await Users.findOne({
      where: { reset_password_token: dto.token },
    });

    if (!user) {
      throw new ValidationError("Token de recuperación inválido");
    }

    // 2. Verificar si el token expiró
    if (
      user.reset_password_token_expires &&
      new Date() > user.reset_password_token_expires
    ) {
      throw new ValidationError(
        "El token de recuperación ha expirado. Solicita uno nuevo"
      );
    }

    // 3. Validar que la nueva contraseña sea diferente
    const isSamePassword = await bcrypt.compare(dto.newPassword, user.password);
    if (isSamePassword) {
      throw new ValidationError(
        "La nueva contraseña debe ser diferente a la anterior"
      );
    }

    // 4. Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    // 5. Actualizar contraseña y limpiar token
    await user.update({
      password: hashedPassword,
      reset_password_token: null,
      reset_password_token_expires: null,
    });

    return {
      message: "Contraseña restablecida exitosamente. Ya puedes iniciar sesión",
    };
  }

  /**
   * Renueva el access token usando un refresh token válido
   * Implementa token rotation: genera nuevo refresh token y revoca el anterior
   */
  async refreshTokens(refreshToken: string): Promise<AuthResponse> {
    try {
      // 1. Verificar y decodificar el refresh token
      const decoded = jwt.verify(refreshToken, this._jwtRefreshSecret) as {
        id: number;
      };

      // 2. Buscar el refresh token en BD
      const storedToken = await RefreshTokens.findOne({
        where: {
          token: refreshToken,
          user_id: decoded.id,
        },
        include: [
          {
            model: Users,
            as: "user",
          },
        ],
      });

      if (!storedToken) {
        throw new AuthError("Refresh token inválido");
      }

      // 3. Verificar si el token es válido (no revocado y no expirado)
      if (!storedToken.isValid()) {
        throw new AuthError("Refresh token expirado o revocado");
      }

      const user = storedToken.user;

      // 4. Verificar que el usuario esté activo
      if (!user.is_active) {
        throw new AuthError(
          "Tu cuenta ha sido desactivada. Contacta al soporte"
        );
      }

      // 5. TOKEN ROTATION: Revocar el refresh token anterior
      await storedToken.update({ is_revoked: true });

      // 6. Generar nuevos tokens (access + refresh)
      const newAccessToken = this.generateToken(user.id, user.email, user.role);
      const newRefreshToken = this._generateRefreshToken(user.id);

      // 7. Guardar el nuevo refresh token en BD
      await this._saveRefreshToken(user.id, newRefreshToken);

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthError("Refresh token inválido");
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthError("Refresh token expirado");
      }
      throw error;
    }
  }

  /**
   * Cierra la sesión actual revocando el refresh token específico
   */
  async logout(refreshToken: string): Promise<{ message: string }> {
    // Buscar y revocar el refresh token
    const storedToken = await RefreshTokens.findOne({
      where: { token: refreshToken },
    });

    if (storedToken && !storedToken.is_revoked) {
      await storedToken.update({ is_revoked: true });
    }

    return {
      message: "Sesión cerrada exitosamente",
    };
  }

  /**
   * Cierra todas las sesiones del usuario revocando todos sus refresh tokens
   */
  async logoutAll(userId: number): Promise<{ message: string }> {
    // Revocar todos los refresh tokens activos del usuario
    await RefreshTokens.update(
      { is_revoked: true },
      {
        where: {
          user_id: userId,
          is_revoked: false,
        },
      }
    );

    return {
      message: "Todas las sesiones han sido cerradas",
    };
  }

  /**
   * Limpia refresh tokens expirados de la base de datos
   * (Este método puede ser llamado por un cron job)
   */
  async cleanExpiredTokens(): Promise<number> {
    const result = await RefreshTokens.destroy({
      where: {
        [Op.or]: [
          { expires_at: { [Op.lt]: new Date() } },
          { is_revoked: true },
        ],
      },
    });

    return result;
  }

  /**
   * Genera un access token JWT
   */
  generateToken(userId: number, email: string, role: string): string {
    return jwt.sign(
      {
        id: userId,
        email,
        role,
      },
      this._jwtSecret,
      { expiresIn: `${this._accessTokenExpirationMinutes}m` } // 30 minutos
    );
  }
}
