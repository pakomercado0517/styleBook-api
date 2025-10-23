import { Request, Response, NextFunction } from "express";
import {
  AuthService,
  RegisterDTO,
  LoginDTO,
  ChangePasswordDTO,
} from "../services/AuthService";
import { ValidationError } from "../utils/errors";

export class AuthController {
  private _authService: AuthService;

  constructor() {
    this._authService = new AuthService();
  }

  async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto: RegisterDTO = {
        name: req.body.name,
        apellido: req.body.apellido,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
      };

      const result = await this._authService.register(dto);
      res.success(result, "Usuario registrado exitosamente", 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: LoginDTO = {
        email: req.body.email,
        password: req.body.password,
      };

      const result = await this._authService.login(dto);
      res.success(result, "Login exitoso");
    } catch (error) {
      next(error);
    }
  }

  async profile(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    res.success(req.user, "Perfil obtenido");
  }

  async changePassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: "Usuario no autenticado" });
        return;
      }

      const dto: ChangePasswordDTO = {
        currentPassword: req.body.currentPassword,
        newPassword: req.body.newPassword,
      };

      const result = await this._authService.changePassword(userId, dto);
      res.success(result, result.message, 200);
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.query.token as string;

      if (!token) {
        throw new ValidationError("Token de verificación requerido");
      }

      const result = await this._authService.verifyEmail(token);
      res.success(result, result.message, 200);
    } catch (error) {
      next(error);
    }
  }

  async resendVerificationEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const email = req.body.email as string;

      if (!email) {
        throw new ValidationError("Email requerido");
      }

      const result = await this._authService.resendVerificationEmail(email);
      res.success(result, result.message, 200);
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const email = req.body.email as string;

      if (!email) {
        throw new ValidationError("Email requerido");
      }

      const result = await this._authService.forgotPassword(email);
      res.success(result, result.message, 200);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.body.token as string;
      const newPassword = req.body.newPassword as string;

      if (!token) {
        throw new ValidationError("Token requerido");
      }

      if (!newPassword) {
        throw new ValidationError("Nueva contraseña requerida");
      }

      const result = await this._authService.resetPassword({
        token,
        newPassword,
      });
      res.success(result, result.message, 200);
    } catch (error) {
      next(error);
    }
  }

  async refreshTokens(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const refreshToken = req.body.refreshToken as string;

      if (!refreshToken) {
        throw new ValidationError("Refresh token requerido");
      }

      const result = await this._authService.refreshTokens(refreshToken);
      res.success(result, "Tokens renovados exitosamente", 200);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.body.refreshToken as string;

      if (!refreshToken) {
        throw new ValidationError("Refresh token requerido");
      }

      const result = await this._authService.logout(refreshToken);
      res.success(result, result.message, 200);
    } catch (error) {
      next(error);
    }
  }

  async logoutAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: "Usuario no autenticado" });
        return;
      }

      const result = await this._authService.logoutAll(userId);
      res.success(result, result.message, 200);
    } catch (error) {
      next(error);
    }
  }
}
