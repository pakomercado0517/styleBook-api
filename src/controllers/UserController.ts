import { Request, Response, NextFunction } from "express";
import { UserService, UserUpdateDTO } from "../services/UserService";

export class UserController {
  private _userService: UserService;

  constructor() {
    this._userService = new UserService();
  }

  async getAllUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await this._userService.getAllUsers(limit, offset);

      res.success(result, "Usuarios obtenidos", 200);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = parseInt(req.params.id);

      const user = await this._userService.getUserById(userId);

      res.success(user, "Usuario obtenido", 200);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      const dto: UserUpdateDTO = req.body;

      const user = await this._userService.updateUser(userId, dto);

      res.success(user, "Usuario actualizado", 200);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = parseInt(req.params.id);

      const result = await this._userService.deleteUser(userId);

      res.success(result, result.message, 200);
    } catch (error) {
      next(error);
    }
  }
}
