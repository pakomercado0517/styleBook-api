import Reviews from "../models/Reviews";
import Providers from "../models/Providers";
import { AppError } from "../utils/errors";

/**
 * RatingService
 * Calcula y actualiza automáticamente el rating promedio de un proveedor
 * Se ejecuta después de crear, actualizar o eliminar una reseña
 */
export class RatingService {
  /**
   * Calcular y actualizar el rating promedio de un proveedor
   *
   * IMPORTANTE:
   * - Se llama después de crear/actualizar/eliminar una reseña
   * - Recalcula todas las reseñas del proveedor
   * - Redondea a 2 decimales
   * - Updatea el campo average_rating en Providers
   */
  async updateProviderRating(providerId: number): Promise<number> {
    // 1. Obtener todas las reseñas del proveedor
    const reviews = await Reviews.findAll({
      where: { provider_id: providerId },
    });

    // 2. Calcular promedio
    let averageRating = 0;

    if (reviews.length > 0) {
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      averageRating = Math.round((totalRating / reviews.length) * 100) / 100;
    }

    // 3. Obtener y actualizar proveedor
    const provider = await Providers.findByPk(providerId);
    if (!provider) {
      throw new AppError(`Proveedor ${providerId} no encontrado`, 404);
    }

    provider.average_rating = averageRating;
    await provider.save();

    return averageRating;
  }

  /**
   * Obtener estadísticas de rating de un proveedor
   */
  async getProviderRatingStats(providerId: number): Promise<{
    average_rating: number;
    total_reviews: number;
    rating_distribution: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  }> {
    // 1. Obtener proveedor
    const provider = await Providers.findByPk(providerId);
    if (!provider) {
      throw new AppError(`Proveedor ${providerId} no encontrado`, 404);
    }

    // 2. Obtener todas las reseñas
    const reviews = await Reviews.findAll({
      where: { provider_id: providerId },
    });

    // 3. Contar distribución de ratings
    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating as keyof typeof distribution]++;
      }
    });

    return {
      average_rating: provider.average_rating || 0,
      total_reviews: reviews.length,
      rating_distribution: distribution,
    };
  }
}
