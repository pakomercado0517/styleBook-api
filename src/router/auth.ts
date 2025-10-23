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

/**
 * PUT /auth/change-password
 * Cambiar contraseña del usuario autenticado
 * Headers: Authorization: Bearer {token}
 * Body: { currentPassword, newPassword }
 */
router.put(
  "/change-password",
  authenticate,
  authValidators.changePassword,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    authController.changePassword(req, res, next)
);

/**
 * GET /auth/verify-email?token=xxx
 * Verificar email del usuario
 * Query: { token }
 */
router.get("/verify-email", (req: Request, res: Response, next: NextFunction) =>
  authController.verifyEmail(req, res, next)
);

/**
 * POST /auth/resend-verification
 * Reenviar email de verificación
 * Body: { email }
 */
router.post(
  "/resend-verification",
  authValidators.resendVerification,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    authController.resendVerificationEmail(req, res, next)
);

/**
 * POST /auth/forgot-password
 * Solicitar recuperación de contraseña
 * Body: { email }
 */
router.post(
  "/forgot-password",
  authValidators.forgotPassword,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    authController.forgotPassword(req, res, next)
);

/**
 * POST /auth/reset-password
 * Restablecer contraseña con token
 * Body: { token, newPassword }
 */
router.post(
  "/reset-password",
  authValidators.resetPassword,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    authController.resetPassword(req, res, next)
);

/**
 * POST /auth/refresh
 * Renovar access token usando refresh token
 * Body: { refreshToken }
 */
router.post(
  "/refresh",
  authValidators.refreshToken,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    authController.refreshTokens(req, res, next)
);

/**
 * POST /auth/logout
 * Cerrar sesión (revocar refresh token específico)
 * Body: { refreshToken }
 */
router.post(
  "/logout",
  authValidators.logout,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    authController.logout(req, res, next)
);

/**
 * POST /auth/logout-all
 * Cerrar todas las sesiones del usuario
 * Headers: Authorization: Bearer {token}
 */
router.post(
  "/logout-all",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    authController.logoutAll(req, res, next)
);

export default router;
