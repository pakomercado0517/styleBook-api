import express, { Request, Response, NextFunction } from "express";
import { UserController } from "../controllers/UserController";
import { authenticate } from "../middlewares";
import { userValidators, handleValidationErrors } from "../validators";

const router = express.Router();
const userController = new UserController();

/**
 * GET /users
 * Obtener todos los usuarios (paginado)
 * Headers: Authorization: Bearer {token}
 * Query: ?page=1&limit=20&role=client
 */
router.get(
  "/",
  authenticate,
  userValidators.getPaginated,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    userController.getAllUsers(req, res, next)
);

/**
 * GET /users/:id
 * Obtener usuario por ID
 * Headers: Authorization: Bearer {token}
 */
router.get(
  "/:id",
  authenticate,
  userValidators.getById,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    userController.getUserById(req, res, next)
);

/**
 * PUT /users/:id
 * Actualizar datos del usuario
 * Headers: Authorization: Bearer {token}
 * Body: { name?, apellido?, phone?, avatar_url?, timezone? }
 */
router.put(
  "/:id",
  authenticate,
  userValidators.update,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    userController.updateUser(req, res, next)
);

/**
 * DELETE /users/:id
 * Eliminar usuario
 * Headers: Authorization: Bearer {token}
 */
router.delete(
  "/:id",
  authenticate,
  userValidators.delete,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    userController.deleteUser(req, res, next)
);

export default router;
