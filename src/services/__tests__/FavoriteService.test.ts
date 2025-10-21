import { FavoriteService } from "../FavoriteService";
import Favorites from "../../models/Favorites";
import Providers from "../../models/Providers";
import Services from "../../models/Services";
import { AppError } from "../../utils/errors";

jest.mock("../../models/Favorites");
jest.mock("../../models/Providers");
jest.mock("../../models/Services");

describe("FavoriteService", () => {
  let favoriteService: FavoriteService;

  beforeEach(() => {
    favoriteService = new FavoriteService();
    jest.clearAllMocks();
  });

  describe("addProviderToFavorites", () => {
    it("debería agregar un proveedor a favoritos exitosamente", async () => {
      const mockProvider = { id: 1, business_name: "Barbería Juan" };
      const mockFavorite = {
        id: 1,
        client_id: 1,
        provider_id: 1,
        service_id: null,
        createdAt: new Date(),
      };

      (Providers.findByPk as jest.Mock).mockResolvedValue(mockProvider);
      (Favorites.findOne as jest.Mock).mockResolvedValue(null);
      (Favorites.create as jest.Mock).mockResolvedValue(mockFavorite);

      const result = await favoriteService.addProviderToFavorites(1, 1);

      expect(result.provider_id).toBe(1);
      expect(result.client_id).toBe(1);
      expect(Providers.findByPk).toHaveBeenCalledWith(1);
      expect(Favorites.create).toHaveBeenCalled();
    });

    it("debería lanzar error si el proveedor no existe", async () => {
      (Providers.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(
        favoriteService.addProviderToFavorites(1, 999)
      ).rejects.toThrow(AppError);
    });

    it("debería lanzar error si ya está en favoritos", async () => {
      const mockProvider = { id: 1, business_name: "Barbería Juan" };

      (Providers.findByPk as jest.Mock).mockResolvedValue(mockProvider);
      (Favorites.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        client_id: 1,
        provider_id: 1,
      });

      await expect(
        favoriteService.addProviderToFavorites(1, 1)
      ).rejects.toThrow(AppError);
    });
  });

  describe("addServiceToFavorites", () => {
    it("debería agregar un servicio a favoritos exitosamente", async () => {
      const mockService = { id: 1, name: "Corte Cabello", price: 25.0 };
      const mockFavorite = {
        id: 1,
        client_id: 1,
        provider_id: null,
        service_id: 1,
        createdAt: new Date(),
      };

      (Services.findByPk as jest.Mock).mockResolvedValue(mockService);
      (Favorites.findOne as jest.Mock).mockResolvedValue(null);
      (Favorites.create as jest.Mock).mockResolvedValue(mockFavorite);

      const result = await favoriteService.addServiceToFavorites(1, 1);

      expect(result.service_id).toBe(1);
      expect(result.client_id).toBe(1);
      expect(Services.findByPk).toHaveBeenCalledWith(1);
      expect(Favorites.create).toHaveBeenCalled();
    });

    it("debería lanzar error si el servicio no existe", async () => {
      (Services.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(
        favoriteService.addServiceToFavorites(1, 999)
      ).rejects.toThrow(AppError);
    });

    it("debería lanzar error si ya está en favoritos", async () => {
      const mockService = { id: 1, name: "Corte Cabello", price: 25.0 };

      (Services.findByPk as jest.Mock).mockResolvedValue(mockService);
      (Favorites.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        client_id: 1,
        service_id: 1,
      });

      await expect(favoriteService.addServiceToFavorites(1, 1)).rejects.toThrow(
        AppError
      );
    });
  });

  describe("getClientFavorites", () => {
    it("debería obtener todos los favoritos del cliente", async () => {
      const mockFavorites = [
        {
          id: 1,
          client_id: 1,
          provider_id: 1,
          service_id: null,
          createdAt: new Date(),
        },
        {
          id: 2,
          client_id: 1,
          provider_id: null,
          service_id: 5,
          createdAt: new Date(),
        },
      ];

      (Favorites.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 2,
        rows: mockFavorites,
      });
      (Providers.findByPk as jest.Mock).mockResolvedValue({
        id: 1,
        business_name: "Barbería",
        average_rating: 4.5,
      });
      (Services.findByPk as jest.Mock).mockResolvedValue({
        id: 5,
        name: "Corte",
        price: 25.0,
      });

      const result = await favoriteService.getClientFavorites(1, 20, 0);

      expect(result.total).toBe(2);
      expect(result.favorites.length).toBe(2);
      expect(result.provider_favorites).toBe(1);
      expect(result.service_favorites).toBe(1);
    });

    it("debería usar paginación por defecto", async () => {
      (Favorites.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 0,
        rows: [],
      });

      await favoriteService.getClientFavorites(1);

      const callArgs = (Favorites.findAndCountAll as jest.Mock).mock
        .calls[0][0];
      expect(callArgs.limit).toBe(20);
      expect(callArgs.offset).toBe(0);
    });
  });

  describe("getClientFavoriteProviders", () => {
    it("debería obtener solo proveedores favoritos", async () => {
      const mockFavorites = [
        {
          id: 1,
          client_id: 1,
          provider_id: 1,
          service_id: null,
          createdAt: new Date(),
        },
      ];

      (Favorites.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: mockFavorites,
      });
      (Providers.findByPk as jest.Mock).mockResolvedValue({
        id: 1,
        business_name: "Barbería",
        average_rating: 4.5,
      });

      const result = await favoriteService.getClientFavoriteProviders(1);

      expect(result.total).toBe(1);
      expect(result.providers.length).toBe(1);
    });
  });

  describe("getClientFavoriteServices", () => {
    it("debería obtener solo servicios favoritos", async () => {
      const mockFavorites = [
        {
          id: 1,
          client_id: 1,
          provider_id: null,
          service_id: 5,
          createdAt: new Date(),
        },
      ];

      (Favorites.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: mockFavorites,
      });
      (Services.findByPk as jest.Mock).mockResolvedValue({
        id: 5,
        name: "Corte",
        price: 25.0,
      });

      const result = await favoriteService.getClientFavoriteServices(1);

      expect(result.total).toBe(1);
      expect(result.services.length).toBe(1);
    });
  });

  describe("isProviderFavorite", () => {
    it("debería devolver true si el proveedor está en favoritos", async () => {
      (Favorites.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        client_id: 1,
        provider_id: 1,
      });

      const result = await favoriteService.isProviderFavorite(1, 1);

      expect(result).toBe(true);
    });

    it("debería devolver false si el proveedor no está en favoritos", async () => {
      (Favorites.findOne as jest.Mock).mockResolvedValue(null);

      const result = await favoriteService.isProviderFavorite(1, 999);

      expect(result).toBe(false);
    });
  });

  describe("isServiceFavorite", () => {
    it("debería devolver true si el servicio está en favoritos", async () => {
      (Favorites.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        client_id: 1,
        service_id: 5,
      });

      const result = await favoriteService.isServiceFavorite(1, 5);

      expect(result).toBe(true);
    });

    it("debería devolver false si el servicio no está en favoritos", async () => {
      (Favorites.findOne as jest.Mock).mockResolvedValue(null);

      const result = await favoriteService.isServiceFavorite(1, 999);

      expect(result).toBe(false);
    });
  });

  describe("removeFavorite", () => {
    it("debería eliminar un favorito", async () => {
      const mockFavorite = {
        id: 1,
        client_id: 1,
        provider_id: 1,
        destroy: jest.fn().mockResolvedValue(undefined),
      };

      (Favorites.findByPk as jest.Mock).mockResolvedValue(mockFavorite);

      await favoriteService.removeFavorite(1, 1);

      expect(mockFavorite.destroy).toHaveBeenCalled();
    });

    it("debería lanzar error si el favorito no existe", async () => {
      (Favorites.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(favoriteService.removeFavorite(1, 999)).rejects.toThrow(
        AppError
      );
    });

    it("debería lanzar error si no tiene permisos", async () => {
      const mockFavorite = {
        id: 1,
        client_id: 2,
        provider_id: 1,
      };

      (Favorites.findByPk as jest.Mock).mockResolvedValue(mockFavorite);

      await expect(favoriteService.removeFavorite(1, 1)).rejects.toThrow(
        AppError
      );
    });
  });

  describe("removeProviderFromFavorites", () => {
    it("debería eliminar un proveedor de favoritos", async () => {
      const mockFavorite = {
        id: 1,
        client_id: 1,
        provider_id: 1,
        destroy: jest.fn().mockResolvedValue(undefined),
      };

      (Favorites.findOne as jest.Mock).mockResolvedValue(mockFavorite);

      await favoriteService.removeProviderFromFavorites(1, 1);

      expect(mockFavorite.destroy).toHaveBeenCalled();
    });

    it("debería lanzar error si no está en favoritos", async () => {
      (Favorites.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        favoriteService.removeProviderFromFavorites(1, 999)
      ).rejects.toThrow(AppError);
    });
  });

  describe("removeServiceFromFavorites", () => {
    it("debería eliminar un servicio de favoritos", async () => {
      const mockFavorite = {
        id: 1,
        client_id: 1,
        service_id: 5,
        destroy: jest.fn().mockResolvedValue(undefined),
      };

      (Favorites.findOne as jest.Mock).mockResolvedValue(mockFavorite);

      await favoriteService.removeServiceFromFavorites(1, 5);

      expect(mockFavorite.destroy).toHaveBeenCalled();
    });

    it("debería lanzar error si no está en favoritos", async () => {
      (Favorites.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        favoriteService.removeServiceFromFavorites(1, 999)
      ).rejects.toThrow(AppError);
    });
  });
});
