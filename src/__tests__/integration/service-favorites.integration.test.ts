import { Request, Response, NextFunction } from "express";
import { ServiceController } from "../../controllers/ServiceController";
import { FavoriteController } from "../../controllers/FavoriteController";
import { ServiceService } from "../../services/ServiceService";
import { FavoriteService } from "../../services/FavoriteService";

/**
 * Tests de Integración para Servicios y Favoritos
 * Verifica flujos: Crear servicio -> Buscar -> Marcar favorito
 */
describe("Service and Favorites Integration Tests", () => {
  let serviceController: ServiceController;
  let favoriteController: FavoriteController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    serviceController = new ServiceController();
    favoriteController = new FavoriteController();

    mockReq = {
      body: {},
      params: {},
      query: {},
      user: { id: 1, role: "client" } as any,
    } as Partial<Request>;

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      success: jest.fn().mockReturnThis(),
    } as Partial<Response>;

    mockNext = jest.fn() as NextFunction;

    jest.clearAllMocks();
  });

  describe("Service Discovery Flow", () => {
    it("debería buscar servicios por nombre", async () => {
      mockReq.query = {
        search: "corte",
        limit: "10",
        offset: "0",
      };

      const mockResults = {
        total: 2,
        count: 2,
        data: [
          {
            id: 1,
            name: "Corte Básico",
            price: 25,
            provider_id: 1,
          },
          {
            id: 2,
            name: "Corte Premium",
            price: 35,
            provider_id: 2,
          },
        ],
      };

      (serviceController as any)._serviceService.searchServices = jest
        .fn()
        .mockResolvedValue(mockResults);

      await serviceController.searchServices(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.success).toHaveBeenCalledWith(
        mockResults,
        "Búsqueda de servicios completada",
        200
      );
    });

    it("debería filtrar servicios por rango de precio", async () => {
      mockReq.query = {
        price_min: "20",
        price_max: "50",
        limit: "10",
        offset: "0",
      };

      const mockResults = {
        total: 1,
        count: 1,
        data: [
          {
            id: 1,
            name: "Servicio",
            price: 35,
          },
        ],
      };

      (serviceController as any)._serviceService.searchServices = jest
        .fn()
        .mockResolvedValue(mockResults);

      await serviceController.searchServices(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.success).toHaveBeenCalled();
    });

    it("debería obtener servicios de un proveedor específico", async () => {
      mockReq.params = { provider_id: "1" };
      mockReq.query = { limit: "10", offset: "0" };

      const mockServices = {
        total: 3,
        count: 3,
        data: [
          { id: 1, name: "Servicio 1", price: 25 },
          { id: 2, name: "Servicio 2", price: 35 },
          { id: 3, name: "Servicio 3", price: 45 },
        ],
      };

      (serviceController as any)._serviceService.getServicesByProvider = jest
        .fn()
        .mockResolvedValue(mockServices);

      await serviceController.getServicesByProvider(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.success).toHaveBeenCalledWith(
        mockServices,
        "Servicios del proveedor obtenidos",
        200
      );
    });
  });

  describe("Add to Favorites Flow", () => {
    it("debería agregar servicio a favoritos después de buscarlo", async () => {
      const clientId = 1;
      const serviceId = 1;

      // Step 1: Buscar servicio
      mockReq.query = { search: "corte" };
      mockReq.user = { id: clientId, role: "client" } as any;

      const searchResults = {
        total: 1,
        data: [
          {
            id: serviceId,
            name: "Corte Básico",
            price: 25,
          },
        ],
      };

      (serviceController as any)._serviceService.searchServices = jest
        .fn()
        .mockResolvedValue(searchResults);

      await serviceController.searchServices(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.success).toHaveBeenCalled();

      // Step 2: Agregar a favoritos
      jest.clearAllMocks();
      mockReq.params = { service_id: serviceId.toString() };

      const mockFavorite = {
        id: 1,
        client_id: clientId,
        service_id: serviceId,
        provider_id: null,
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

    it("debería verificar si un servicio es favorito", async () => {
      mockReq.params = { service_id: "1" };
      mockReq.user = { id: 1, role: "client" } as any;

      (favoriteController as any)._favoriteService.isServiceFavorite = jest
        .fn()
        .mockResolvedValue(true);

      await favoriteController.isServiceFavorite(
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

    it("debería obtener todos los servicios favoritos del cliente", async () => {
      mockReq.query = { limit: "20", offset: "0" };
      mockReq.user = { id: 1, role: "client" } as any;

      const mockFavorites = {
        services: [
          {
            id: 1,
            client_id: 1,
            service_id: 1,
            service: {
              id: 1,
              name: "Servicio Favorito",
              price: 25,
            },
          },
        ],
        total: 1,
      };

      (favoriteController as any)._favoriteService.getClientFavoriteServices =
        jest.fn().mockResolvedValue(mockFavorites);

      await favoriteController.getClientFavoriteServices(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.success).toHaveBeenCalled();
    });
  });

  describe("Provider Favorites Flow", () => {
    it("debería agregar proveedor a favoritos", async () => {
      mockReq.params = { provider_id: "1" };
      mockReq.user = { id: 1, role: "client" } as any;

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

    it("debería obtener todos los proveedores favoritos", async () => {
      mockReq.query = { limit: "20", offset: "0" };
      mockReq.user = { id: 1, role: "client" } as any;

      const mockProviders = {
        providers: [
          {
            id: 1,
            client_id: 1,
            provider_id: 1,
            provider: {
              id: 1,
              business_name: "Barbería Premium",
              city: "CDMX",
            },
          },
        ],
        total: 1,
      };

      (favoriteController as any)._favoriteService.getClientFavoriteProviders =
        jest.fn().mockResolvedValue(mockProviders);

      await favoriteController.getClientFavoriteProviders(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.success).toHaveBeenCalled();
    });

    it("debería eliminar proveedor de favoritos", async () => {
      mockReq.params = { provider_id: "1" };
      mockReq.user = { id: 1, role: "client" } as any;

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

  describe("Search and Filter Integration", () => {
    it("debería combinar múltiples filtros: búsqueda + precio + proveedor", async () => {
      mockReq.query = {
        search: "corte",
        price_min: "20",
        price_max: "50",
        provider_id: "1",
        sort: "price_asc",
        limit: "10",
        offset: "0",
      };

      const mockResults = {
        total: 1,
        count: 1,
        data: [
          {
            id: 1,
            name: "Corte Básico",
            price: 25,
            provider_id: 1,
          },
        ],
      };

      (serviceController as any)._serviceService.searchServices = jest
        .fn()
        .mockResolvedValue(mockResults);

      await serviceController.searchServices(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(
        (serviceController as any)._serviceService.searchServices
      ).toHaveBeenCalled();
      expect(mockRes.success).toHaveBeenCalled();
    });

    it("debería retornar resultados vacíos si no hay coincidencias", async () => {
      mockReq.query = {
        search: "inexistente",
        limit: "10",
        offset: "0",
      };

      const mockResults = {
        total: 0,
        count: 0,
        data: [],
      };

      (serviceController as any)._serviceService.searchServices = jest
        .fn()
        .mockResolvedValue(mockResults);

      await serviceController.searchServices(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.success).toHaveBeenCalledWith(
        mockResults,
        "Búsqueda de servicios completada",
        200
      );
    });
  });

  describe("Error Handling in Integration", () => {
    it("debería manejar error al agregar duplicado a favoritos", async () => {
      mockReq.params = { service_id: "1" };
      mockReq.user = { id: 1, role: "client" } as any;

      const error = new Error("Este servicio ya está en tus favoritos");
      (favoriteController as any)._favoriteService.addServiceToFavorites = jest
        .fn()
        .mockRejectedValue(error);

      await favoriteController.addServiceToFavorites(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it("debería rechazar sin autenticación", async () => {
      mockReq.user = undefined;
      mockReq.params = { service_id: "1" };

      await favoriteController.addServiceToFavorites(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it("debería validar parámetros inválidos", async () => {
      mockReq.params = { service_id: "invalid" };
      mockReq.user = { id: 1, role: "client" } as any;

      await favoriteController.addServiceToFavorites(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });
});
