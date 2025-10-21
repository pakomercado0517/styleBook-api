import Reviews from "../models/Reviews";
import Appointments from "../models/Appointments";
import Users from "../models/Users";
import Providers from "../models/Providers";
import { RatingService } from "./RatingService";
import { AppError } from "../utils/errors";

export interface CreateReviewDTO {
  appointment_id: number;
  rating: number;
  comment?: string;
}

export interface UpdateReviewDTO {
  rating?: number;
  comment?: string;
  provider_response?: string;
}

export interface ReviewResponse {
  id: number;
  appointment_id: number;
  client_id: number;
  provider_id: number;
  rating: number;
  comment: string | null;
  provider_response: string | null;
  client: {
    id: number;
    name: string;
    apellido: string;
    avatar_url: string | null;
  };
  provider: {
    id: number;
    business_name: string;
    rating_average: number;
    avatar_url: string | null;
  };
  appointment: {
    id: number;
    start_date: string;
    end_date: string;
    status: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class ReviewService {
  private _ratingService: RatingService;

  constructor() {
    this._ratingService = new RatingService();
  }

  /**
   * Crear una nueva reseña
   * @throws Error si la cita no existe o no está completada
   */
  async createReview(
    clientId: number,
    dto: CreateReviewDTO
  ): Promise<ReviewResponse> {
    // 1. Validar que la cita exista
    const appointment = await Appointments.findByPk(dto.appointment_id);
    if (!appointment) {
      throw new AppError(`Cita ${dto.appointment_id} no encontrada`, 404);
    }

    // 2. Validar que la cita pertenezca al cliente
    if (appointment.client_id !== clientId) {
      throw new AppError("La cita no pertenece a este cliente", 403);
    }

    // 3. Validar que la cita esté completada
    if (appointment.status !== "completed") {
      throw new AppError("Solo se pueden reseñar citas completadas", 409);
    }

    // 4. Verificar si ya existe reseña para esta cita
    const existingReview = await Reviews.findOne({
      where: { appointment_id: dto.appointment_id },
    });

    if (existingReview) {
      throw new AppError("Ya existe una reseña para esta cita", 409);
    }

    // 5. Validar rating (1-5)
    if (dto.rating < 1 || dto.rating > 5) {
      throw new AppError("El rating debe estar entre 1 y 5", 400);
    }

    // 6. Crear la reseña
    const review = await Reviews.create({
      appointment_id: dto.appointment_id,
      client_id: clientId,
      provider_id: appointment.provider_id,
      rating: dto.rating,
      comment: dto.comment || null,
    });

    // 7. Actualizar rating promedio del proveedor ⭐
    await this._ratingService.updateProviderRating(appointment.provider_id);

    // 8. Retornar con información adicional
    return this._mapToResponse(review);
  }

  /**
   * Obtener todas las reseñas de un proveedor
   */
  async getProviderReviews(
    providerId: number,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    reviews: ReviewResponse[];
    total: number;
    averageRating: number;
  }> {
    const { count, rows } = await Reviews.findAndCountAll({
      where: { provider_id: providerId },
      offset: (page - 1) * limit,
      limit,
      order: [["createdAt", "DESC"]],
    });

    const averageRating =
      count > 0
        ? rows.reduce(
            (sum: number, review: Reviews) => sum + review.rating,
            0
          ) / count
        : 0;

    const mappedReviews = await Promise.all(
      rows.map((review: Reviews) => this._mapToResponse(review))
    );

    return {
      reviews: mappedReviews,
      total: count,
      averageRating: Math.round(averageRating * 100) / 100,
    };
  }

  /**
   * Obtener reseñas escritas por un cliente
   */
  async getClientReviews(
    clientId: number,
    page: number = 1,
    limit: number = 20
  ): Promise<{ reviews: ReviewResponse[]; total: number }> {
    const { count, rows } = await Reviews.findAndCountAll({
      where: { client_id: clientId },
      offset: (page - 1) * limit,
      limit,
      order: [["createdAt", "DESC"]],
    });

    const mappedReviews = await Promise.all(
      rows.map((review: Reviews) => this._mapToResponse(review))
    );

    return {
      reviews: mappedReviews,
      total: count,
    };
  }

  /**
   * Obtener una reseña por ID
   */
  async getReviewById(reviewId: number): Promise<ReviewResponse> {
    const review = await Reviews.findByPk(reviewId);
    if (!review) {
      throw new Error(`Review ${reviewId} not found`);
    }

    return this._mapToResponse(review);
  }

  /**
   * Actualizar una reseña
   */
  async updateReview(
    reviewId: number,
    clientId: number,
    dto: UpdateReviewDTO
  ): Promise<ReviewResponse> {
    const review = await Reviews.findByPk(reviewId);
    if (!review) {
      throw new AppError(`Reseña ${reviewId} no encontrada`, 404);
    }

    // Solo el cliente que escribió la reseña puede actualizarla
    if (review.client_id !== clientId) {
      throw new AppError("No tienes permisos para actualizar esta reseña", 403);
    }

    let ratingChanged = false;

    if (dto.rating !== undefined) {
      if (dto.rating < 1 || dto.rating > 5) {
        throw new AppError("El rating debe estar entre 1 y 5", 400);
      }
      if (dto.rating !== review.rating) {
        ratingChanged = true;
      }
      review.rating = dto.rating;
    }

    if (dto.comment !== undefined) {
      review.comment = dto.comment;
    }

    // Solo el proveedor puede responder
    if (dto.provider_response !== undefined) {
      const provider = await Providers.findByPk(review.provider_id);
      const providerUser = provider
        ? await Users.findByPk(provider.user_id)
        : null;

      if (providerUser?.id !== clientId) {
        throw new AppError("Solo el proveedor puede agregar respuesta", 403);
      }

      review.provider_response = dto.provider_response;
    }

    await review.save();

    // Actualizar rating promedio si cambió la calificación ⭐
    if (ratingChanged) {
      await this._ratingService.updateProviderRating(review.provider_id);
    }

    return this._mapToResponse(review);
  }

  /**
   * Eliminar una reseña
   */
  async deleteReview(
    reviewId: number,
    clientId: number
  ): Promise<ReviewResponse> {
    const review = await Reviews.findByPk(reviewId);
    if (!review) {
      throw new AppError(`Reseña ${reviewId} no encontrada`, 404);
    }

    // Solo el cliente que escribió la reseña puede eliminarla
    if (review.client_id !== clientId) {
      throw new AppError("No tienes permisos para eliminar esta reseña", 403);
    }

    const deletedReview = await this._mapToResponse(review);
    const providerId = review.provider_id;

    await review.destroy();

    // Actualizar rating promedio después de eliminar ⭐
    await this._ratingService.updateProviderRating(providerId);

    return deletedReview;
  }

  /**
   * Mapear modelo a respuesta con información adicional
   */
  private async _mapToResponse(review: Reviews): Promise<ReviewResponse> {
    const appointment = await Appointments.findByPk(review.appointment_id);
    const client = await Users.findByPk(review.client_id);
    const provider = await Providers.findByPk(review.provider_id);
    const providerUser = provider
      ? await Users.findByPk(provider.user_id)
      : null;

    if (!appointment || !client || !provider || !providerUser) {
      throw new Error("Associated data not found for review");
    }

    return {
      id: review.id,
      appointment_id: review.appointment_id,
      client_id: review.client_id,
      provider_id: review.provider_id,
      rating: review.rating,
      comment: review.comment,
      provider_response: review.provider_response,
      client: {
        id: client.id,
        name: client.name,
        apellido: client.apellido,
        avatar_url: client.avatar_url,
      },
      provider: {
        id: provider.id,
        business_name: provider.business_name,
        rating_average: provider.average_rating,
        avatar_url: providerUser.avatar_url,
      },
      appointment: {
        id: appointment.id,
        start_date: appointment.start_date.toISOString(),
        end_date: appointment.end_date.toISOString(),
        status: appointment.status,
      },
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }
}
