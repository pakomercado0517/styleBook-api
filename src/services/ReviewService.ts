import Reviews from "../models/Reviews";
import Appointments from "../models/Appointments";
import Users from "../models/Users";
import Providers from "../models/Providers";

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
      throw new Error(`Appointment ${dto.appointment_id} not found`);
    }

    // 2. Validar que la cita pertenezca al cliente
    if (appointment.client_id !== clientId) {
      throw new Error("Unauthorized: appointment does not belong to client");
    }

    // 3. Validar que la cita esté completada
    if (appointment.status !== "completed") {
      throw new Error("Cannot review appointment that is not completed");
    }

    // 4. Verificar si ya existe reseña para esta cita
    const existingReview = await Reviews.findOne({
      where: { appointment_id: dto.appointment_id },
    });

    if (existingReview) {
      throw new Error("Review already exists for this appointment");
    }

    // 5. Validar rating (1-5)
    if (dto.rating < 1 || dto.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    // 6. Crear la reseña
    const review = await Reviews.create({
      appointment_id: dto.appointment_id,
      client_id: clientId,
      provider_id: appointment.provider_id,
      rating: dto.rating,
      comment: dto.comment || null,
    });

    // 7. Retornar con información adicional
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
      throw new Error(`Review ${reviewId} not found`);
    }

    // Solo el cliente que escribió la reseña puede actualizarla
    if (review.client_id !== clientId) {
      throw new Error("Unauthorized: cannot update review");
    }

    if (dto.rating !== undefined) {
      if (dto.rating < 1 || dto.rating > 5) {
        throw new Error("Rating must be between 1 and 5");
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
        throw new Error("Unauthorized: only provider can add response");
      }

      review.provider_response = dto.provider_response;
    }

    await review.save();
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
      throw new Error(`Review ${reviewId} not found`);
    }

    // Solo el cliente que escribió la reseña puede eliminarla
    if (review.client_id !== clientId) {
      throw new Error("Unauthorized: cannot delete review");
    }

    const deletedReview = await this._mapToResponse(review);
    await review.destroy();
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
