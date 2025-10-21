import Employees from "../models/Employees";
import Appointments from "../models/Appointments";
import HorariosBlocked from "../models/HorariosBlocked";
import Providers from "../models/Providers";
import Services from "../models/Services";
import {
  localToUtc,
  utcToLocal,
  formatInTimezone,
  datesOverlap,
} from "../utils/dateUtils";
import { AppError } from "../utils/errors";

export interface AvailableSlot {
  start_utc: string;
  start_local: string;
  end_utc: string;
  end_local: string;
  formatted: string;
}

export interface AvailabilityDTO {
  employee_id: number;
  service_id: number;
  date: string; // YYYY-MM-DD
  timezone: string;
}

export interface AvailabilityResponse {
  employee_id: number;
  date: string;
  timezone: string;
  available_slots: AvailableSlot[];
  total_available_slots: number;
}

export class AvailabilityService {
  /**
   * Obtener slots disponibles para un empleado en una fecha específica
   *
   * IMPORTANTE:
   * 1. La fecha se recibe como YYYY-MM-DD en timezone local
   * 2. Se convierte a UTC para consultas en BD
   * 3. Se generan slots en UTC
   * 4. Se retornan slots con UTC + Local para frontend
   */
  async getEmployeeAvailability(
    dto: AvailabilityDTO
  ): Promise<AvailabilityResponse> {
    // 1. Validar que el empleado exista
    const employee = await Employees.findByPk(dto.employee_id);
    if (!employee) {
      throw new AppError(`Empleado ${dto.employee_id} no encontrado`, 404);
    }

    // 2. Obtener proveedor
    const provider = await Providers.findByPk(employee.provider_id);
    if (!provider) {
      throw new AppError(`Proveedor no encontrado`, 404);
    }

    // 3. Obtener servicio
    const service = await Services.findByPk(dto.service_id);
    if (!service) {
      throw new AppError(`Servicio ${dto.service_id} no encontrado`, 404);
    }

    // 4. Convertir fecha local YYYY-MM-DD a UTC
    // El usuario envía: "2025-10-25" en su timezone
    // Convertimos a: 2025-10-25 00:00:00 UTC
    const dateStr = `${dto.date}T00:00:00`;
    const dayStartUtc = localToUtc(dateStr, dto.timezone);
    const dayEndUtc = new Date(dayStartUtc.getTime() + 24 * 60 * 60 * 1000);

    // 5. Obtener citas confirmadas/pendientes (almacenadas en UTC)
    const appointments = await Appointments.findAll({
      where: {
        employee_id: dto.employee_id,
        status: ["pending", "confirmed"],
      },
    });

    // 6. Obtener horarios bloqueados (almacenados en UTC)
    const blockedHours = await HorariosBlocked.findAll({
      where: {
        employee_id: dto.employee_id,
      },
    });

    // 7. Generar slots disponibles (en UTC, slots de 30 minutos)
    const slots = this._generateTimeSlots(
      dayStartUtc,
      dayEndUtc,
      service.duration_minutes,
      provider.opening_time || "09:00",
      provider.closing_time || "17:00",
      dto.timezone
    );

    // 8. Filtrar slots disponibles
    const availableSlots = slots.filter((slot) => {
      const slotStart = new Date(slot.start_utc);
      const slotEnd = new Date(slot.end_utc);

      // Verificar si hay conflicto con citas (todas en UTC)
      const appointmentConflict = appointments.some((apt: Appointments) =>
        datesOverlap(slotStart, slotEnd, apt.start_date, apt.end_date)
      );

      if (appointmentConflict) return false;

      // Verificar si hay conflicto con horarios bloqueados (todos en UTC)
      const blockedConflict = blockedHours.some((blocked: HorariosBlocked) =>
        datesOverlap(slotStart, slotEnd, blocked.start_date, blocked.end_date)
      );

      if (blockedConflict) return false;

      return true;
    });

    return {
      employee_id: dto.employee_id,
      date: dto.date,
      timezone: dto.timezone,
      available_slots: availableSlots,
      total_available_slots: availableSlots.length,
    };
  }

  /**
   * Obtener disponibilidad para múltiples empleados
   * Útil para mostrar opciones al cliente
   */
  async getEmployeesAvailability(
    provider_id: number,
    dto: Omit<AvailabilityDTO, "employee_id">
  ): Promise<AvailabilityResponse[]> {
    // Obtener todos los empleados del proveedor
    const employees = await Employees.findAll({
      where: { provider_id },
    });

    if (employees.length === 0) {
      throw new AppError(`No hay empleados para este proveedor`, 404);
    }

    // Obtener disponibilidad para cada empleado
    const availabilities = await Promise.all(
      employees.map((emp) =>
        this.getEmployeeAvailability({
          employee_id: emp.id,
          service_id: dto.service_id,
          date: dto.date,
          timezone: dto.timezone,
        })
      )
    );

    return availabilities;
  }

  /**
   * Generar slots de 30 minutos en el horario laboral
   *
   * IMPORTANTE: Todos los cálculos en UTC
   * - dayStart y dayEnd están en UTC
   * - openingTime y closingTime son hora local del proveedor
   * - Convertimos a UTC para generar slots
   */
  private _generateTimeSlots(
    dayStart: Date,
    dayEnd: Date,
    serviceDuration: number,
    openingTime: string,
    closingTime: string,
    timezone: string
  ): AvailableSlot[] {
    const slots: AvailableSlot[] = [];

    // Parsear horarios de apertura/cierre (formato: "HH:mm")
    const [openHour, openMin] = openingTime.split(":").map(Number);
    const [closeHour, closeMin] = closingTime.split(":").map(Number);

    // Crear fecha con hora de apertura en timezone local
    const dayDate = new Date(dayStart);
    const openTimeLocal = `${dayStart.getUTCFullYear()}-${String(
      dayStart.getUTCMonth() + 1
    ).padStart(
      2,
      "0"
    )}-${String(dayStart.getUTCDate()).padStart(2, "0")}T${String(
      openHour
    ).padStart(2, "0")}:${String(openMin).padStart(2, "0")}:00`;

    const closeTimeLocal = `${dayStart.getUTCFullYear()}-${String(
      dayStart.getUTCMonth() + 1
    ).padStart(
      2,
      "0"
    )}-${String(dayStart.getUTCDate()).padStart(2, "0")}T${String(
      closeHour
    ).padStart(2, "0")}:${String(closeMin).padStart(2, "0")}:00`;

    // Convertir horarios locales a UTC
    const openTimeUtc = localToUtc(openTimeLocal, timezone);
    const closeTimeUtc = localToUtc(closeTimeLocal, timezone);

    // Generar slots cada 30 minutos (en UTC)
    let currentTime = new Date(openTimeUtc);

    while (
      currentTime.getTime() + serviceDuration * 60 * 1000 <=
      closeTimeUtc.getTime()
    ) {
      const slotEnd = new Date(
        currentTime.getTime() + serviceDuration * 60 * 1000
      );

      // Convertir a local para mostrar
      const startLocal = utcToLocal(currentTime, timezone);
      const endLocal = utcToLocal(slotEnd, timezone);

      slots.push({
        start_utc: currentTime.toISOString(),
        start_local: startLocal.toISOString(),
        end_utc: slotEnd.toISOString(),
        end_local: endLocal.toISOString(),
        formatted: `${this._formatTime(startLocal)} - ${this._formatTime(
          endLocal
        )}`,
      });

      // Avanzar 30 minutos
      currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000);
    }

    return slots;
  }

  /**
   * Formatear hora como HH:mm
   */
  private _formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }
}
