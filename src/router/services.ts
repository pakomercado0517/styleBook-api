import express, { Request, Response, NextFunction } from "express";
import { ServiceController } from "../controllers/ServiceController";
import { authenticate } from "../middlewares";
import { serviceValidators, handleValidationErrors } from "../validators";

const router = express.Router();
const serviceController = new ServiceController();

/**
 * GET /services/search
 * Buscar servicios con filtros avanzados
 * Query: ?search=corte&price_min=10&price_max=100&city=Madrid&sort_by=price_asc&limit=20&offset=0
 */
router.get("/search", (req: Request, res: Response, next: NextFunction) =>
  serviceController.searchServices(req, res, next)
);

/**
 * GET /services
 * Obtener todos los servicios (paginado)
 * Query: ?page=1&limit=20&provider_id=7&price_min=100&price_max=500
 */
router.get("/", (req: Request, res: Response, next: NextFunction) =>
  serviceController.getAllServices(req, res, next)
);

/**
 * GET /services/:id
 * Obtener servicio por ID
 */
router.get(
  "/:id",
  serviceValidators.getById,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    serviceController.getServiceById(req, res, next)
);

/**
 * GET /services/provider/:providerId
 * Obtener servicios de un proveedor
 */
router.get(
  "/provider/:providerId",
  (req: Request, res: Response, next: NextFunction) =>
    serviceController.getServicesByProvider(req, res, next)
);

/**
 * POST /services/provider/:providerId
 * Crear servicio
 * Headers: Authorization: Bearer {token}
 * Body: { name, description?, price, duration_minutes, provider_id }
 */
router.post(
  "/provider/:providerId",
  authenticate,
  serviceValidators.create,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    serviceController.createService(req, res, next)
);

/**
 * PUT /services/:id
 * Actualizar servicio
 * Headers: Authorization: Bearer {token}
 * Body: { name?, description?, price?, duration_minutes? }
 */
router.put(
  "/:id",
  authenticate,
  serviceValidators.update,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    serviceController.updateService(req, res, next)
);

/**
 * DELETE /services/:id
 * Eliminar servicio
 * Headers: Authorization: Bearer {token}
 */
router.delete(
  "/:id",
  authenticate,
  serviceValidators.delete,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    serviceController.deleteService(req, res, next)
);

export default router;
