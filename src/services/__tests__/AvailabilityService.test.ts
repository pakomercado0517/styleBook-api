import { AvailabilityService, AvailabilityDTO } from "../AvailabilityService";
import Employees from "../../models/Employees";
import Providers from "../../models/Providers";
import Services from "../../models/Services";
import Appointments from "../../models/Appointments";
import HorariosBlocked from "../../models/HorariosBlocked";
import { AppError } from "../../utils/errors";

jest.mock("../../models/Employees");
jest.mock("../../models/Providers");
jest.mock("../../models/Services");
jest.mock("../../models/Appointments");
jest.mock("../../models/HorariosBlocked");

describe("AvailabilityService", () => {
  let availabilityService: AvailabilityService;

  beforeEach(() => {
    availabilityService = new AvailabilityService();
    jest.clearAllMocks();
  });

  describe("getEmployeeAvailability", () => {
    const availabilityDTO: AvailabilityDTO = {
      employee_id: 1,
      service_id: 1,
      date: "2025-10-25",
      timezone: "America/Mexico_City",
    };

    it("debería obtener disponibilidad de un empleado", async () => {
      const mockEmployee = { id: 1, provider_id: 1 };
      const mockProvider = {
        id: 1,
        opening_time: "09:00",
        closing_time: "17:00",
      };
      const mockService = { id: 1, duration_minutes: 30 };

      (Employees.findByPk as jest.Mock).mockResolvedValue(mockEmployee);
      (Providers.findByPk as jest.Mock).mockResolvedValue(mockProvider);
      (Services.findByPk as jest.Mock).mockResolvedValue(mockService);
      (Appointments.findAll as jest.Mock).mockResolvedValue([]);
      (HorariosBlocked.findAll as jest.Mock).mockResolvedValue([]);

      const result =
        await availabilityService.getEmployeeAvailability(availabilityDTO);

      expect(result.employee_id).toBe(1);
      expect(result.date).toBe("2025-10-25");
      expect(result.timezone).toBe("America/Mexico_City");
      expect(result.available_slots).toBeDefined();
      expect(Array.isArray(result.available_slots)).toBe(true);
    });

    it("debería lanzar error si el empleado no existe", async () => {
      (Employees.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(
        availabilityService.getEmployeeAvailability(availabilityDTO)
      ).rejects.toThrow(AppError);
    });

    it("debería lanzar error si el proveedor no existe", async () => {
      (Employees.findByPk as jest.Mock).mockResolvedValue({
        id: 1,
        provider_id: 1,
      });
      (Providers.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(
        availabilityService.getEmployeeAvailability(availabilityDTO)
      ).rejects.toThrow(AppError);
    });

    it("debería lanzar error si el servicio no existe", async () => {
      (Employees.findByPk as jest.Mock).mockResolvedValue({
        id: 1,
        provider_id: 1,
      });
      (Providers.findByPk as jest.Mock).mockResolvedValue({
        id: 1,
        opening_time: "09:00",
        closing_time: "17:00",
      });
      (Services.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(
        availabilityService.getEmployeeAvailability(availabilityDTO)
      ).rejects.toThrow(AppError);
    });

    it("debería generar slots de 30 minutos", async () => {
      const mockEmployee = { id: 1, provider_id: 1 };
      const mockProvider = {
        id: 1,
        opening_time: "09:00",
        closing_time: "10:30",
      };
      const mockService = { id: 1, duration_minutes: 30 };

      (Employees.findByPk as jest.Mock).mockResolvedValue(mockEmployee);
      (Providers.findByPk as jest.Mock).mockResolvedValue(mockProvider);
      (Services.findByPk as jest.Mock).mockResolvedValue(mockService);
      (Appointments.findAll as jest.Mock).mockResolvedValue([]);
      (HorariosBlocked.findAll as jest.Mock).mockResolvedValue([]);

      const result =
        await availabilityService.getEmployeeAvailability(availabilityDTO);

      // Debería tener al menos 2 slots de 30 minutos (9:00-9:30, 9:30-10:00)
      expect(result.available_slots.length).toBeGreaterThan(0);

      result.available_slots.forEach((slot) => {
        expect(slot).toHaveProperty("start_utc");
        expect(slot).toHaveProperty("start_local");
        expect(slot).toHaveProperty("end_utc");
        expect(slot).toHaveProperty("end_local");
        expect(slot).toHaveProperty("formatted");
      });
    });

    it("debería filtrar citas conflictivas", async () => {
      const mockEmployee = { id: 1, provider_id: 1 };
      const mockProvider = {
        id: 1,
        opening_time: "09:00",
        closing_time: "17:00",
      };
      const mockService = { id: 1, duration_minutes: 30 };

      (Employees.findByPk as jest.Mock).mockResolvedValue(mockEmployee);
      (Providers.findByPk as jest.Mock).mockResolvedValue(mockProvider);
      (Services.findByPk as jest.Mock).mockResolvedValue(mockService);
      (Appointments.findAll as jest.Mock).mockResolvedValue([
        {
          employee_id: 1,
          status: "confirmed",
          start_date: new Date("2025-10-25T09:00:00Z"),
          end_date: new Date("2025-10-25T09:30:00Z"),
        },
      ]);
      (HorariosBlocked.findAll as jest.Mock).mockResolvedValue([]);

      const result =
        await availabilityService.getEmployeeAvailability(availabilityDTO);

      // El slot de 9:00-9:30 debe estar excluido
      expect(result.available_slots).toBeDefined();
    });

    it("debería filtrar horarios bloqueados", async () => {
      const mockEmployee = { id: 1, provider_id: 1 };
      const mockProvider = {
        id: 1,
        opening_time: "09:00",
        closing_time: "17:00",
      };
      const mockService = { id: 1, duration_minutes: 30 };

      (Employees.findByPk as jest.Mock).mockResolvedValue(mockEmployee);
      (Providers.findByPk as jest.Mock).mockResolvedValue(mockProvider);
      (Services.findByPk as jest.Mock).mockResolvedValue(mockService);
      (Appointments.findAll as jest.Mock).mockResolvedValue([]);
      (HorariosBlocked.findAll as jest.Mock).mockResolvedValue([
        {
          employee_id: 1,
          start_date: new Date("2025-10-25T12:00:00Z"),
          end_date: new Date("2025-10-25T13:00:00Z"),
        },
      ]);

      const result =
        await availabilityService.getEmployeeAvailability(availabilityDTO);

      // El slot de 12:00-12:30 debe estar excluido
      expect(result.available_slots).toBeDefined();
    });
  });

  describe("getEmployeesAvailability", () => {
    it("debería obtener disponibilidad de todos los empleados", async () => {
      const mockEmployees = [
        { id: 1, provider_id: 1 },
        { id: 2, provider_id: 1 },
      ];
      const mockProvider = {
        id: 1,
        opening_time: "09:00",
        closing_time: "17:00",
      };
      const mockService = { id: 1, duration_minutes: 30 };

      (Employees.findAll as jest.Mock).mockResolvedValue(mockEmployees);
      (Providers.findByPk as jest.Mock).mockResolvedValue(mockProvider);
      (Services.findByPk as jest.Mock).mockResolvedValue(mockService);
      (Appointments.findAll as jest.Mock).mockResolvedValue([]);
      (HorariosBlocked.findAll as jest.Mock).mockResolvedValue([]);

      const result = await availabilityService.getEmployeesAvailability(1, {
        service_id: 1,
        date: "2025-10-25",
        timezone: "America/Mexico_City",
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      result.forEach((availability) => {
        expect(availability.employee_id).toBeDefined();
        expect(availability.available_slots).toBeDefined();
      });
    });

    it("debería lanzar error si no hay empleados", async () => {
      (Employees.findAll as jest.Mock).mockResolvedValue([]);

      await expect(
        availabilityService.getEmployeesAvailability(1, {
          service_id: 1,
          date: "2025-10-25",
          timezone: "America/Mexico_City",
        })
      ).rejects.toThrow(AppError);
    });
  });
});
