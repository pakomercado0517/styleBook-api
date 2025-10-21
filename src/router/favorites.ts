import express, { Request, Response, NextFunction } from "express";
import { FavoriteController } from "../controllers/FavoriteController";
import { authenticate } from "../middlewares";

const router = express.Router();
const favoriteController = new FavoriteController();

// Todos los endpoints de favoritos requieren autenticación
router.use(authenticate);

/**
 * POST /favorites/provider/:provider_id
 * Agregar proveedor a favoritos
 */
router.post(
  "/provider/:provider_id",
  (req: Request, res: Response, next: NextFunction) =>
    favoriteController.addProviderToFavorites(req, res, next)
);

/**
 * POST /favorites/service/:service_id
 * Agregar servicio a favoritos
 */
router.post(
  "/service/:service_id",
  (req: Request, res: Response, next: NextFunction) =>
    favoriteController.addServiceToFavorites(req, res, next)
);

/**
 * GET /favorites
 * Obtener todos los favoritos
 */
router.get("/", (req: Request, res: Response, next: NextFunction) =>
  favoriteController.getClientFavorites(req, res, next)
);

/**
 * GET /favorites/providers
 * Obtener solo proveedores favoritos
 */
router.get("/providers", (req: Request, res: Response, next: NextFunction) =>
  favoriteController.getClientFavoriteProviders(req, res, next)
);

/**
 * GET /favorites/services
 * Obtener solo servicios favoritos
 */
router.get("/services", (req: Request, res: Response, next: NextFunction) =>
  favoriteController.getClientFavoriteServices(req, res, next)
);

/**
 * GET /favorites/provider/:provider_id/is-favorite
 * Verificar si un proveedor está en favoritos
 */
router.get(
  "/provider/:provider_id/is-favorite",
  (req: Request, res: Response, next: NextFunction) =>
    favoriteController.isProviderFavorite(req, res, next)
);

/**
 * GET /favorites/service/:service_id/is-favorite
 * Verificar si un servicio está en favoritos
 */
router.get(
  "/service/:service_id/is-favorite",
  (req: Request, res: Response, next: NextFunction) =>
    favoriteController.isServiceFavorite(req, res, next)
);

/**
 * DELETE /favorites/:id
 * Eliminar un favorito por ID
 */
router.delete("/:id", (req: Request, res: Response, next: NextFunction) =>
  favoriteController.removeFavorite(req, res, next)
);

/**
 * DELETE /favorites/provider/:provider_id
 * Eliminar proveedor de favoritos
 */
router.delete(
  "/provider/:provider_id",
  (req: Request, res: Response, next: NextFunction) =>
    favoriteController.removeProviderFromFavorites(req, res, next)
);

/**
 * DELETE /favorites/service/:service_id
 * Eliminar servicio de favoritos
 */
router.delete(
  "/service/:service_id",
  (req: Request, res: Response, next: NextFunction) =>
    favoriteController.removeServiceFromFavorites(req, res, next)
);

export default router;
