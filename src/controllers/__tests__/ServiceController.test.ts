import { ServiceController } from "../ServiceController";
import { ServiceService } from "../../services/ServiceService";
import { Request, Response, NextFunction } from "express";

jest.mock("../../services/ServiceService");

describe("ServiceController", () => {
  let serviceController: ServiceController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    serviceController = new ServiceController();

    mockReq = {
      body: {},
      params: {},
      query: {},
      user: { id: 1, role: "provider" } as any,
    } as Partial<Request>;

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      success: jest.fn().mockReturnThis(),
    } as Partial<Response>;

    mockNext = jest.fn() as NextFunction;

    jest.clearAllMocks();
  });

  describe("createService", () => {
    it("debería crear un servicio exitosamente", async () => {
      mockReq.params = { providerId: "1" };
      mockReq.body = {
        name: "Corte Cabello",
        description: "Corte profesional",
        duration_minutes: 30,
        price: 25.0,
      };

      const mockService = {
        id: 1,
        provider_id: 1,
        ...mockReq.body,
      };

      (serviceController as any)._serviceService.createService = jest
        .fn()
        .mockResolvedValue(mockService);

      await serviceController.createService(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.success).toHaveBeenCalledWith(
        mockService,
        "Servicio creado exitosamente",
        201
      );
    });

    it("debería pasar errores al middleware", async () => {
      mockReq.params = { providerId: "999" };
      mockReq.body = {
        name: "Corte",
        duration_minutes: 30,
        price: 25,
      };

      const error = new Error("Proveedor no encontrado");
      (serviceController as any)._serviceService.createService = jest
        .fn()
        .mockRejectedValue(error);

      await serviceController.createService(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("getAllServices", () => {
    it("debería obtener todos los servicios", async () => {
      mockReq.query = { limit: "10", offset: "0" };

      const mockServices = {
        total: 2,
        count: 2,
        data: [
          { id: 1, name: "Corte", price: 25 },
          { id: 2, name: "Tinte", price: 45 },
        ],
      };

      (serviceController as any)._serviceService.getAllServices = jest
        .fn()
        .mockResolvedValue(mockServices);

      await serviceController.getAllServices(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.success).toHaveBeenCalledWith(
        mockServices,
        "Servicios obtenidos",
        200
      );
    });
  });

  describe("searchServices", () => {
    it("debería buscar servicios con filtros", async () => {
      mockReq.query = {
        search: "corte",
        price_min: "10",
        price_max: "50",
        limit: "20",
        offset: "0",
      };

      const mockResults = {
        total: 1,
        count: 1,
        limit: 20,
        offset: 0,
        data: [
          {
            id: 1,
            name: "Corte Básico",
            price: 25,
            description: "Corte profesional",
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

    it("debería usar valores por defecto de paginación", async () => {
      mockReq.query = {};

      const mockResults = {
        total: 5,
        count: 5,
        limit: 10,
        offset: 0,
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

      expect(mockRes.success).toHaveBeenCalled();
    });
  });

  describe("getServiceById", () => {
    it("debería obtener un servicio por ID", async () => {
      mockReq.params = { id: "1" };

      const mockService = {
        id: 1,
        name: "Corte",
        price: 25,
        provider: { id: 1, business_name: "Barbería" },
      };

      (serviceController as any)._serviceService.getServiceById = jest
        .fn()
        .mockResolvedValue(mockService);

      await serviceController.getServiceById(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.success).toHaveBeenCalledWith(
        mockService,
        "Servicio obtenido",
        200
      );
    });

    it("debería retornar error si servicio no existe", async () => {
      mockReq.params = { id: "999" };

      const error = new Error("Servicio no encontrado");
      (serviceController as any)._serviceService.getServiceById = jest
        .fn()
        .mockRejectedValue(error);

      await serviceController.getServiceById(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("getServicesByProvider", () => {
    it("debería obtener servicios por proveedor", async () => {
      mockReq.params = { provider_id: "1" };
      mockReq.query = { limit: "10", offset: "0" };

      const mockServices = {
        total: 2,
        count: 2,
        data: [
          { id: 1, name: "Corte", price: 25 },
          { id: 2, name: "Tinte", price: 45 },
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

  describe("updateService", () => {
    it("debería actualizar un servicio", async () => {
      mockReq.params = { id: "1" };
      mockReq.body = {
        name: "Corte Premium",
        price: 35,
      };

      const mockUpdatedService = {
        id: 1,
        ...mockReq.body,
      };

      (serviceController as any)._serviceService.updateService = jest
        .fn()
        .mockResolvedValue(mockUpdatedService);

      await serviceController.updateService(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.success).toHaveBeenCalledWith(
        mockUpdatedService,
        "Servicio actualizado",
        200
      );
    });
  });

  describe("deleteService", () => {
    it("debería eliminar un servicio", async () => {
      mockReq.params = { id: "1" };

      const mockResponse = { message: "Servicio eliminado exitosamente" };

      (serviceController as any)._serviceService.deleteService = jest
        .fn()
        .mockResolvedValue(mockResponse);

      await serviceController.deleteService(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.success).toHaveBeenCalledWith(
        mockResponse,
        "Servicio eliminado exitosamente",
        200
      );
    });
  });
});
