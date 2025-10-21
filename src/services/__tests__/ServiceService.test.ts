import {
  ServiceService,
  CreateServiceDTO,
  UpdateServiceDTO,
  SearchServicesDTO,
} from "../ServiceService";
import Services from "../../models/Services";
import Providers from "../../models/Providers";
import { NotFoundError, AppError } from "../../utils/errors";

jest.mock("../../models/Services");
jest.mock("../../models/Providers");

describe("ServiceService", () => {
  let serviceService: ServiceService;

  beforeEach(() => {
    serviceService = new ServiceService();
    jest.clearAllMocks();
  });

  describe("createService", () => {
    const createDTO: CreateServiceDTO = {
      name: "Corte Cabello",
      description: "Corte profesional",
      duration_minutes: 30,
      price: 25.0,
      image_url: "http://example.com/image.jpg",
    };

    it("debería crear un servicio exitosamente", async () => {
      const mockProvider = { id: 1, business_name: "Barbería Juan" };
      const mockService = {
        id: 1,
        provider_id: 1,
        name: "Corte Cabello",
        description: "Corte profesional",
        duration_minutes: 30,
        price: 25.0,
        image_url: "http://example.com/image.jpg",
      };

      (Providers.findByPk as jest.Mock).mockResolvedValue(mockProvider);
      (Services.create as jest.Mock).mockResolvedValue(mockService);

      const result = await serviceService.createService(1, createDTO);

      expect(result.name).toBe("Corte Cabello");
      expect(result.price).toBe(25.0);
      expect(Providers.findByPk).toHaveBeenCalledWith(1);
      expect(Services.create).toHaveBeenCalledWith({
        provider_id: 1,
        ...createDTO,
      });
    });

    it("debería lanzar error si el proveedor no existe", async () => {
      (Providers.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(
        serviceService.createService(999, createDTO)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("getAllServices", () => {
    it("debería obtener todos los servicios con paginación", async () => {
      const mockServices = [
        { id: 1, name: "Corte", price: 25.0 },
        { id: 2, name: "Tinte", price: 45.0 },
      ];

      (Services.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 2,
        rows: mockServices,
      });

      const result = await serviceService.getAllServices(10, 0);

      expect(result.total).toBe(2);
      expect(result.count).toBe(2);
      expect(result.data).toEqual(mockServices);
      expect(Services.findAndCountAll).toHaveBeenCalled();
    });

    it("debería usar valores por defecto de paginación", async () => {
      (Services.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 0,
        rows: [],
      });

      await serviceService.getAllServices();

      expect(Services.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 0,
        })
      );
    });
  });

  describe("searchServices", () => {
    const searchDTO: SearchServicesDTO = {
      search: "corte",
      price_min: 10,
      price_max: 50,
      city: "Madrid",
      sort_by: "price_asc",
      limit: 20,
      offset: 0,
    };

    it("debería buscar servicios con filtros", async () => {
      const mockServices = [
        {
          id: 1,
          name: "Corte Básico",
          price: 20.0,
          provider: { id: 1, business_name: "Barbería Juan", city: "Madrid" },
        },
      ];

      (Services.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: mockServices,
      });

      const result = await serviceService.searchServices(searchDTO);

      expect(result.total).toBe(1);
      expect(result.data).toEqual(mockServices);
      expect(result.limit).toBe(20);
    });

    it("debería aplicar filtro por nombre/descripción", async () => {
      (Services.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 0,
        rows: [],
      });

      await serviceService.searchServices({ search: "corte" });

      const callArgs = (Services.findAndCountAll as jest.Mock).mock.calls[0][0];
      expect(callArgs.where).toBeDefined();
    });

    it("debería aplicar filtro por rango de precio", async () => {
      (Services.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 0,
        rows: [],
      });

      await serviceService.searchServices({ price_min: 10, price_max: 50 });

      const callArgs = (Services.findAndCountAll as jest.Mock).mock.calls[0][0];
      expect(callArgs.where.price).toBeDefined();
    });

    it("debería ordenar por precio ascendente", async () => {
      (Services.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 0,
        rows: [],
      });

      await serviceService.searchServices({ sort_by: "price_asc" });

      const callArgs = (Services.findAndCountAll as jest.Mock).mock.calls[0][0];
      expect(callArgs.order).toContainEqual(["price", "ASC"]);
    });

    it("debería ordenar por precio descendente", async () => {
      (Services.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 0,
        rows: [],
      });

      await serviceService.searchServices({ sort_by: "price_desc" });

      const callArgs = (Services.findAndCountAll as jest.Mock).mock.calls[0][0];
      expect(callArgs.order).toContainEqual(["price", "DESC"]);
    });

    it("debería ordenar por nombre", async () => {
      (Services.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 0,
        rows: [],
      });

      await serviceService.searchServices({ sort_by: "name" });

      const callArgs = (Services.findAndCountAll as jest.Mock).mock.calls[0][0];
      expect(callArgs.order).toContainEqual(["name", "ASC"]);
    });

    it("debería ordenar por rating", async () => {
      (Services.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 0,
        rows: [],
      });

      await serviceService.searchServices({ sort_by: "rating" });

      const callArgs = (Services.findAndCountAll as jest.Mock).mock.calls[0][0];
      expect(callArgs.order).toBeDefined();
    });

    it("debería usar valores por defecto", async () => {
      (Services.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 0,
        rows: [],
      });

      await serviceService.searchServices({});

      const callArgs = (Services.findAndCountAll as jest.Mock).mock.calls[0][0];
      expect(callArgs.limit).toBe(10);
      expect(callArgs.offset).toBe(0);
    });
  });

  describe("getServiceById", () => {
    it("debería obtener un servicio por ID", async () => {
      const mockService = {
        id: 1,
        name: "Corte Cabello",
        price: 25.0,
        provider: { id: 1, business_name: "Barbería Juan" },
      };

      (Services.findByPk as jest.Mock).mockResolvedValue(mockService);

      const result = await serviceService.getServiceById(1);

      expect(result).toEqual(mockService);
      expect(Services.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
    });

    it("debería lanzar error si el servicio no existe", async () => {
      (Services.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(serviceService.getServiceById(999)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("getServicesByProvider", () => {
    it("debería obtener servicios por proveedor", async () => {
      const mockProvider = { id: 1, business_name: "Barbería Juan" };
      const mockServices = [
        { id: 1, name: "Corte", price: 25.0 },
        { id: 2, name: "Tinte", price: 45.0 },
      ];

      (Providers.findByPk as jest.Mock).mockResolvedValue(mockProvider);
      (Services.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 2,
        rows: mockServices,
      });

      const result = await serviceService.getServicesByProvider(1, 10, 0);

      expect(result.total).toBe(2);
      expect(result.data).toEqual(mockServices);
      expect(Providers.findByPk).toHaveBeenCalledWith(1);
    });

    it("debería lanzar error si el proveedor no existe", async () => {
      (Providers.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(serviceService.getServicesByProvider(999)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("updateService", () => {
    const updateDTO: UpdateServiceDTO = {
      name: "Corte Premium",
      price: 35.0,
    };

    it("debería actualizar un servicio", async () => {
      const mockService = {
        id: 1,
        name: "Corte Cabello",
        price: 25.0,
        update: jest.fn().mockResolvedValue(undefined),
      };

      (Services.findByPk as jest.Mock).mockResolvedValue(mockService);

      const result = await serviceService.updateService(1, updateDTO);

      expect(mockService.update).toHaveBeenCalledWith(updateDTO);
    });

    it("debería lanzar error si el servicio no existe", async () => {
      (Services.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(
        serviceService.updateService(999, updateDTO)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteService", () => {
    it("debería eliminar un servicio", async () => {
      const mockService = {
        id: 1,
        name: "Corte Cabello",
        destroy: jest.fn().mockResolvedValue(undefined),
      };

      (Services.findByPk as jest.Mock).mockResolvedValue(mockService);

      const result = await serviceService.deleteService(1);

      expect(mockService.destroy).toHaveBeenCalled();
      expect(result.message).toBe("Servicio eliminado exitosamente");
    });

    it("debería lanzar error si el servicio no existe", async () => {
      (Services.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(serviceService.deleteService(999)).rejects.toThrow(
        NotFoundError
      );
    });
  });
});
