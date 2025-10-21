import express, { Request, Response, NextFunction } from "express";
import { ReviewController } from "../controllers/ReviewController";
import { authenticate } from "../middlewares";
import { reviewValidators, handleValidationErrors } from "../validators";

const router = express.Router();
const reviewController = new ReviewController();

/**
 * POST /reviews
 * Crear una nueva reseña
 * Headers: Authorization: Bearer {token}
 * Body: { appointment_id, rating, comment? }
 */
router.post(
  "/",
  authenticate,
  reviewValidators.create,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    reviewController.createReview(req, res, next)
);

/**
 * GET /reviews/provider/:provider_id
 * Obtener reseñas de un proveedor (público)
 * Query: ?page=1&limit=20
 */
router.get(
  "/provider/:provider_id",
  reviewValidators.getProviderReviews,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    reviewController.getProviderReviews(req, res, next)
);

/**
 * GET /reviews/client/my-reviews
 * Obtener reseñas escritas por el cliente autenticado
 * Headers: Authorization: Bearer {token}
 * Query: ?page=1&limit=20
 */
router.get(
  "/client/my-reviews",
  authenticate,
  reviewValidators.getPaginated,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    reviewController.getClientReviews(req, res, next)
);

/**
 * GET /reviews/:id
 * Obtener una reseña específica
 */
router.get(
  "/:id",
  reviewValidators.getById,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    reviewController.getReviewById(req, res, next)
);

/**
 * PUT /reviews/:id
 * Actualizar una reseña
 * Headers: Authorization: Bearer {token}
 * Body: { rating?, comment?, provider_response? }
 */
router.put(
  "/:id",
  authenticate,
  reviewValidators.update,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    reviewController.updateReview(req, res, next)
);

/**
 * DELETE /reviews/:id
 * Eliminar una reseña
 * Headers: Authorization: Bearer {token}
 */
router.delete(
  "/:id",
  authenticate,
  reviewValidators.delete,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    reviewController.deleteReview(req, res, next)
);

/**
 * GET /reviews/provider/:provider_id/stats ⭐ NUEVO
 * Obtener estadísticas de rating de un proveedor
 * Público - sin autenticación requerida
 */
router.get(
  "/provider/:provider_id/stats",
  (req: Request, res: Response, next: NextFunction) =>
    reviewController.getProviderRatingStats(req, res, next)
);

export default router;
