import express, { Request, Response, NextFunction } from "express";
import { ProviderController } from "../controllers/ProviderController";
import { authenticate, authorize } from "../middlewares";
import { providerValidators, handleValidationErrors } from "../validators";

const router = express.Router();
const providerController = new ProviderController();

/**
 * GET /providers
 * Obtener todos los proveedores (paginado)
 * Query: ?page=1&limit=20&city=Mexico&business_type=Salon
 */
router.get("/", (req: Request, res: Response, next: NextFunction) =>
  providerController.getAllProviders(req, res, next)
);

/**
 * GET /providers/:id
 * Obtener proveedor por ID
 */
router.get(
  "/:id",
  providerValidators.getById,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    providerController.getProviderById(req, res, next)
);

/**
 * POST /providers
 * Crear perfil de proveedor
 * Headers: Authorization: Bearer {token}
 * Body: { business_name, business_type?, description?, city? }
 */
router.post(
  "/",
  authenticate,
  authorize(["provider"]),
  providerValidators.create,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    providerController.createProvider(req, res, next)
);

/**
 * PUT /providers/:id
 * Actualizar perfil de proveedor
 * Headers: Authorization: Bearer {token}
 * Body: { business_name?, business_type?, description? }
 */
router.put(
  "/:id",
  authenticate,
  providerValidators.update,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    providerController.updateProvider(req, res, next)
);

/**
 * DELETE /providers/:id
 * Eliminar proveedor
 * Headers: Authorization: Bearer {token}
 */
router.delete(
  "/:id",
  authenticate,
  providerValidators.delete,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    providerController.deleteProvider(req, res, next)
);

export default router;
