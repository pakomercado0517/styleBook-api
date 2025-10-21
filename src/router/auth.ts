import express, { Request, Response, NextFunction } from "express";
import { AuthController } from "../controllers/AuthController";
import { authenticate } from "../middlewares";
import { authValidators, handleValidationErrors } from "../validators";

const router = express.Router();
const authController = new AuthController();

/**
 * POST /auth/register
 * Registrar nuevo usuario
 * Body: { name, apellido, email, password, role }
 */
router.post(
  "/register",
  authValidators.register,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    authController.register(req, res, next)
);

/**
 * POST /auth/login
 * Iniciar sesión
 * Body: { email, password }
 */
router.post(
  "/login",
  authValidators.login,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    authController.login(req, res, next)
);

/**
 * GET /auth/profile
 * Obtener perfil del usuario autenticado
 * Headers: Authorization: Bearer {token}
 */
router.get(
  "/profile",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    authController.profile(req, res, next)
);

export default router;
