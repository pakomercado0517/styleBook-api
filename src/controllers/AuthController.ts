import { Request, Response, NextFunction } from "express";
import {
  AuthService,
  RegisterDTO,
  LoginDTO,
  ChangePasswordDTO,
} from "../services/AuthService";

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
}
