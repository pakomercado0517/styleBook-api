import { Request, Response, NextFunction } from "express";
import {
  ReviewService,
  CreateReviewDTO,
  UpdateReviewDTO,
} from "../services/ReviewService";
import { RatingService } from "../services/RatingService";

export class ReviewController {
  private _reviewService: ReviewService;
  private _ratingService: RatingService;

  constructor() {
    this._reviewService = new ReviewService();
    this._ratingService = new RatingService();
  }

  /**
   * POST /reviews
   * Crear una nueva reseña
   */
  async createReview(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const clientId = req.user?.id;
      if (!clientId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const dto: CreateReviewDTO = req.body;

      if (!dto.appointment_id || !dto.rating) {
        res.status(400).json({
          error: "Missing required fields: appointment_id, rating",
        });
        return;
      }

      const review = await this._reviewService.createReview(clientId, dto);

      res.success(review, "Reseña creada exitosamente", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /reviews/provider/:provider_id
   * Obtener reseñas de un proveedor
   */
  async getProviderReviews(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const providerId = parseInt(req.params.provider_id);
      if (isNaN(providerId)) {
        res.status(400).json({ error: "Invalid provider ID" });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (limit > 100) {
        res.status(400).json({ error: "Limit cannot exceed 100" });
        return;
      }

      const result = await this._reviewService.getProviderReviews(
        providerId,
        page,
        limit
      );

      res.success(
        {
          reviews: result.reviews,
          statistics: {
            total: result.total,
            averageRating: result.averageRating,
          },
          pagination: {
            page,
            limit,
            total: result.total,
            pages: Math.ceil(result.total / limit),
          },
        },
        "Reseñas del proveedor obtenidas exitosamente",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /reviews/client/my-reviews
   * Obtener reseñas escritas por el cliente autenticado
   */
  async getClientReviews(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const clientId = req.user?.id;
      if (!clientId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (limit > 100) {
        res.status(400).json({ error: "Limit cannot exceed 100" });
        return;
      }

      const result = await this._reviewService.getClientReviews(
        clientId,
        page,
        limit
      );

      res.success(
        {
          reviews: result.reviews,
          pagination: {
            page,
            limit,
            total: result.total,
            pages: Math.ceil(result.total / limit),
          },
        },
        "Mis reseñas obtenidas exitosamente",
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /reviews/:id
   * Obtener una reseña específica por ID
   */
  async getReviewById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const reviewId = parseInt(req.params.id);

      if (isNaN(reviewId)) {
        res.status(400).json({ error: "Invalid review ID" });
        return;
      }

      const review = await this._reviewService.getReviewById(reviewId);

      res.success(review, "Reseña obtenida exitosamente", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /reviews/:id
   * Actualizar una reseña
   */
  async updateReview(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const clientId = req.user?.id;
      if (!clientId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const reviewId = parseInt(req.params.id);

      if (isNaN(reviewId)) {
        res.status(400).json({ error: "Invalid review ID" });
        return;
      }

      const dto: UpdateReviewDTO = req.body;

      const review = await this._reviewService.updateReview(
        reviewId,
        clientId,
        dto
      );

      res.success(review, "Reseña actualizada exitosamente", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /reviews/:id
   * Eliminar una reseña
   */
  async deleteReview(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const clientId = req.user?.id;
      if (!clientId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const reviewId = parseInt(req.params.id);

      if (isNaN(reviewId)) {
        res.status(400).json({ error: "Invalid review ID" });
        return;
      }

      const review = await this._reviewService.deleteReview(reviewId, clientId);

      res.success(review, "Reseña eliminada exitosamente", 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /reviews/provider/:provider_id/stats ⭐ NUEVO
   * Obtener estadísticas de rating de un proveedor
   */
  async getProviderRatingStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const providerId = parseInt(req.params.provider_id);
      if (isNaN(providerId)) {
        res.status(400).json({ error: "Invalid provider ID" });
        return;
      }

      const stats =
        await this._ratingService.getProviderRatingStats(providerId);

      res.success(stats, "Estadísticas de rating obtenidas exitosamente", 200);
    } catch (error) {
      next(error);
    }
  }
}
