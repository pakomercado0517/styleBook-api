import { FavoriteController } from "../FavoriteController";
import { FavoriteService } from "../../services/FavoriteService";
import { Request, Response, NextFunction } from "express";

jest.mock("../../services/FavoriteService");

describe("FavoriteController", () => {
  let favoriteController: FavoriteController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    favoriteController = new FavoriteController();

    mockReq = {
      body: {},
      params: {},
      query: {},
      user: { id: 1 } as any,
    } as Partial<Request>;

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      success: jest.fn().mockReturnThis(),
    } as Partial<Response>;

    mockNext = jest.fn() as NextFunction;

    jest.clearAllMocks();
  });

  describe("addProviderToFavorites", () => {
    it("debería agregar proveedor a favoritos", async () => {
      mockReq.params = { provider_id: "1" };

      const mockFavorite = {
        id: 1,
        client_id: 1,
        provider_id: 1,
        service_id: null,
        createdAt: new Date(),
      };

      (favoriteController as any)._favoriteService.addProviderToFavorites = jest
        .fn()
        .mockResolvedValue(mockFavorite);

      await favoriteController.addProviderToFavorites(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.success).toHaveBeenCalledWith(
        mockFavorite,
        "Proveedor agregado a favoritos",
        201
      );
    });

    it("debería retornar 401 si no hay usuario", async () => {
      mockReq.user = undefined;
      mockReq.params = { provider_id: "1" };

      await favoriteController.addProviderToFavorites(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it("debería retornar 400 si provider_id es inválido", async () => {
      mockReq.params = { provider_id: "invalid" };

      await favoriteController.addProviderToFavorites(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe("addServiceToFavorites", () => {
    it("debería agregar servicio a favoritos", async () => {
      mockReq.params = { service_id: "5" };

      const mockFavorite = {
        id: 2,
        client_id: 1,
        provider_id: null,
        service_id: 5,
        createdAt: new Date(),
      };

      (favoriteController as any)._favoriteService.addServiceToFavorites = jest
        .fn()
        .mockResolvedValue(mockFavorite);

      await favoriteController.addServiceToFavorites(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.success).toHaveBeenCalledWith(
        mockFavorite,
        "Servicio agregado a favoritos",
        201
      );
    });
  });

  describe("getClientFavorites", () => {
    it("debería obtener todos los favoritos", async () => {
      mockReq.query = { limit: "20", offset: "0" };

      const mockResult = {
        favorites: [
          {
            id: 1,
            client_id: 1,
            provider_id: 1,
            service_id: null,
          },
        ],
        total: 1,
        provider_favorites: 1,
        service_favorites: 0,
      };

      (favoriteController as any)._favoriteService.getClientFavorites = jest
        .fn()
        .mockResolvedValue(mockResult);

      await favoriteController.getClientFavorites(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.success).toHaveBeenCalledWith(
        mockResult,
        "Favoritos obtenidos exitosamente",
        200
      );
    });

    it("debería rechazar limite mayor a 100", async () => {
      mockReq.query = { limit: "150", offset: "0" };

      await favoriteController.getClientFavorites(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe("getClientFavoriteProviders", () => {
    it("debería obtener solo proveedores favoritos", async () => {
      mockReq.query = { limit: "20", offset: "0" };

      const mockResult = {
        providers: [
          {
            id: 1,
            client_id: 1,
            provider_id: 1,
          },
        ],
        total: 1,
      };

      (favoriteController as any)._favoriteService.getClientFavoriteProviders =
        jest.fn().mockResolvedValue(mockResult);

      await favoriteController.getClientFavoriteProviders(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.success).toHaveBeenCalledWith(
        mockResult,
        "Proveedores favoritos obtenidos",
        200
      );
    });
  });

  describe("getClientFavoriteServices", () => {
    it("debería obtener solo servicios favoritos", async () => {
      mockReq.query = { limit: "20", offset: "0" };

      const mockResult = {
        services: [
          {
            id: 1,
            client_id: 1,
            service_id: 5,
          },
        ],
        total: 1,
      };

      (favoriteController as any)._favoriteService.getClientFavoriteServices =
        jest.fn().mockResolvedValue(mockResult);

      await favoriteController.getClientFavoriteServices(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.success).toHaveBeenCalledWith(
        mockResult,
        "Servicios favoritos obtenidos",
        200
      );
    });
  });

  describe("isProviderFavorite", () => {
    it("debería verificar si proveedor está en favoritos", async () => {
      mockReq.params = { provider_id: "1" };

      (favoriteController as any)._favoriteService.isProviderFavorite = jest
        .fn()
        .mockResolvedValue(true);

      await favoriteController.isProviderFavorite(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.success).toHaveBeenCalledWith(
        { is_favorite: true },
        "Verificación completada",
        200
      );
    });

    it("debería retornar false si no está en favoritos", async () => {
      mockReq.params = { provider_id: "999" };

      (favoriteController as any)._favoriteService.isProviderFavorite = jest
        .fn()
        .mockResolvedValue(false);

      await favoriteController.isProviderFavorite(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.success).toHaveBeenCalledWith(
        { is_favorite: false },
        "Verificación completada",
        200
      );
    });
  });

  describe("removeFavorite", () => {
    it("debería eliminar un favorito", async () => {
      mockReq.params = { id: "1" };

      (favoriteController as any)._favoriteService.removeFavorite = jest
        .fn()
        .mockResolvedValue(undefined);

      await favoriteController.removeFavorite(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.success).toHaveBeenCalledWith(
        { message: "Favorito eliminado" },
        "Favorito eliminado exitosamente",
        200
      );
    });

    it("debería pasar errores al middleware", async () => {
      mockReq.params = { id: "999" };

      const error = new Error("Favorito no encontrado");
      (favoriteController as any)._favoriteService.removeFavorite = jest
        .fn()
        .mockRejectedValue(error);

      await favoriteController.removeFavorite(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("removeProviderFromFavorites", () => {
    it("debería eliminar proveedor de favoritos", async () => {
      mockReq.params = { provider_id: "1" };

      (favoriteController as any)._favoriteService.removeProviderFromFavorites =
        jest.fn().mockResolvedValue(undefined);

      await favoriteController.removeProviderFromFavorites(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.success).toHaveBeenCalledWith(
        { message: "Proveedor eliminado de favoritos" },
        "Proveedor eliminado de favoritos exitosamente",
        200
      );
    });
  });

  describe("removeServiceFromFavorites", () => {
    it("debería eliminar servicio de favoritos", async () => {
      mockReq.params = { service_id: "5" };

      (favoriteController as any)._favoriteService.removeServiceFromFavorites =
        jest.fn().mockResolvedValue(undefined);

      await favoriteController.removeServiceFromFavorites(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.success).toHaveBeenCalledWith(
        { message: "Servicio eliminado de favoritos" },
        "Servicio eliminado de favoritos exitosamente",
        200
      );
    });
  });
});
