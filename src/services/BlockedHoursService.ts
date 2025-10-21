import HorariosBlocked from "../models/HorariosBlocked";
import Providers from "../models/Providers";
import Employees from "../models/Employees";
import { localToUtc, utcToLocal, formatInTimezone } from "../utils/dateUtils";

export type BlockedReason =
  | "vacation"
  | "sick_leave"
  | "maintenance"
  | "break"
  | "other";

export interface CreateBlockedHoursDTO {
  start_date: string;
  end_date: string;
  reason: BlockedReason;
  employee_id?: number;
  provider_id?: number;
}

export interface UpdateBlockedHoursDTO {
  start_date?: string;
  end_date?: string;
  reason?: BlockedReason;
}

export interface BlockedHoursResponse {
  id: number;
  provider_id: number | null;
  employee_id: number | null;
  start_date_utc: string;
  end_date_utc: string;
  start_date_local: string;
  end_date_local: string;
  formatted_dates: {
    start: string;
    end: string;
  };
  reason: BlockedReason;
  duration_minutes: number;
  provider?: {
    id: number;
    business_name: string;
  };
  employee?: {
    id: number;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class BlockedHoursService {
  /**
   * Crear nuevo horario bloqueado
   * @throws Error si los datos son inválidos
   */
  async createBlockedHours(
    dto: CreateBlockedHoursDTO,
    timezone: string
  ): Promise<BlockedHoursResponse> {
    // 1. Validar que al menos uno de provider_id o employee_id esté presente
    if (!dto.provider_id && !dto.employee_id) {
      throw new Error("Either provider_id or employee_id must be provided");
    }

    // 2. Si es employee, validar que exista
    if (dto.employee_id) {
      const employee = await Employees.findByPk(dto.employee_id);
      if (!employee) {
        throw new Error(`Employee ${dto.employee_id} not found`);
      }
      dto.provider_id = employee.provider_id;
    }

    // 3. Si es provider, validar que exista
    if (dto.provider_id) {
      const provider = await Providers.findByPk(dto.provider_id);
      if (!provider) {
        throw new Error(`Provider ${dto.provider_id} not found`);
      }
    }

    // 4. Validar que el reason esté en los valores permitidos
    const validReasons: BlockedReason[] = [
      "vacation",
      "sick_leave",
      "maintenance",
      "break",
      "other",
    ];
    if (!validReasons.includes(dto.reason)) {
      throw new Error(
        `Invalid reason. Must be one of: ${validReasons.join(", ")}`
      );
    }

    // 5. Convertir fechas locales a UTC
    const startUtc = localToUtc(dto.start_date, timezone);
    const endUtc = localToUtc(dto.end_date, timezone);

    // 6. Validar que fecha de fin sea después de inicio
    if (startUtc >= endUtc) {
      throw new Error("End date must be after start date");
    }

    // 7. Crear el horario bloqueado
    const blocked = await HorariosBlocked.create({
      provider_id: dto.provider_id,
      employee_id: dto.employee_id,
      start_date: startUtc,
      end_date: endUtc,
      reason: dto.reason,
    });

    // 8. Retornar con información adicional
    return this._mapToResponse(blocked, timezone);
  }

  /**
   * Obtener todos los horarios bloqueados de un proveedor
   */
  async getProviderBlockedHours(
    providerId: number,
    page: number = 1,
    limit: number = 20,
    timezone: string
  ): Promise<{ blockedHours: BlockedHoursResponse[]; total: number }> {
    const { count, rows } = await HorariosBlocked.findAndCountAll({
      where: { provider_id: providerId },
      offset: (page - 1) * limit,
      limit,
      order: [["start_date", "ASC"]],
    });

    return {
      blockedHours: rows.map((blocked: HorariosBlocked) =>
        this._mapToResponse(blocked, timezone)
      ),
      total: count,
    };
  }

  /**
   * Obtener todos los horarios bloqueados de un empleado
   */
  async getEmployeeBlockedHours(
    employeeId: number,
    page: number = 1,
    limit: number = 20,
    timezone: string
  ): Promise<{ blockedHours: BlockedHoursResponse[]; total: number }> {
    const { count, rows } = await HorariosBlocked.findAndCountAll({
      where: { employee_id: employeeId },
      offset: (page - 1) * limit,
      limit,
      order: [["start_date", "ASC"]],
    });

    return {
      blockedHours: rows.map((blocked: HorariosBlocked) =>
        this._mapToResponse(blocked, timezone)
      ),
      total: count,
    };
  }

  /**
   * Obtener un horario bloqueado por ID
   */
  async getBlockedHoursById(
    blockedHoursId: number,
    timezone: string
  ): Promise<BlockedHoursResponse> {
    const blocked = await HorariosBlocked.findByPk(blockedHoursId);
    if (!blocked) {
      throw new Error(`Blocked hours ${blockedHoursId} not found`);
    }

    return this._mapToResponse(blocked, timezone);
  }

  /**
   * Obtener horarios bloqueados en un rango de fechas
   */
  async getBlockedHoursByDateRange(
    providerId: number,
    startDate: string,
    endDate: string,
    timezone: string
  ): Promise<BlockedHoursResponse[]> {
    const startUtc = localToUtc(startDate, timezone);
    const endUtc = localToUtc(endDate, timezone);

    const blocked = await HorariosBlocked.findAll({
      where: {
        provider_id: providerId,
        start_date: { $lte: endUtc },
        end_date: { $gte: startUtc },
      },
      order: [["start_date", "ASC"]],
    });

    return blocked.map((b: HorariosBlocked) =>
      this._mapToResponse(b, timezone)
    );
  }

  /**
   * Actualizar un horario bloqueado
   */
  async updateBlockedHours(
    blockedHoursId: number,
    dto: UpdateBlockedHoursDTO,
    timezone: string
  ): Promise<BlockedHoursResponse> {
    const blocked = await HorariosBlocked.findByPk(blockedHoursId);
    if (!blocked) {
      throw new Error(`Blocked hours ${blockedHoursId} not found`);
    }

    if (dto.start_date) {
      const startUtc = localToUtc(dto.start_date, timezone);
      blocked.start_date = startUtc;
    }

    if (dto.end_date) {
      const endUtc = localToUtc(dto.end_date, timezone);
      blocked.end_date = endUtc;
    }

    // Validar que fecha de fin sea después de inicio
    if (blocked.start_date >= blocked.end_date) {
      throw new Error("End date must be after start date");
    }

    if (dto.reason) {
      const validReasons: BlockedReason[] = [
        "vacation",
        "sick_leave",
        "maintenance",
        "break",
        "other",
      ];
      if (!validReasons.includes(dto.reason)) {
        throw new Error(
          `Invalid reason. Must be one of: ${validReasons.join(", ")}`
        );
      }
      blocked.reason = dto.reason;
    }

    await blocked.save();
    return this._mapToResponse(blocked, timezone);
  }

  /**
   * Eliminar un horario bloqueado
   */
  async deleteBlockedHours(blockedHoursId: number): Promise<boolean> {
    const blocked = await HorariosBlocked.findByPk(blockedHoursId);
    if (!blocked) {
      throw new Error(`Blocked hours ${blockedHoursId} not found`);
    }

    await blocked.destroy();
    return true;
  }

  /**
   * Mapear modelo a respuesta con información adicional
   */
  private _mapToResponse(
    blocked: HorariosBlocked,
    timezone: string
  ): BlockedHoursResponse {
    const durationMinutes = Math.round(
      (blocked.end_date.getTime() - blocked.start_date.getTime()) / (1000 * 60)
    );

    return {
      id: blocked.id,
      provider_id: blocked.provider_id,
      employee_id: blocked.employee_id,
      start_date_utc: blocked.start_date.toISOString(),
      end_date_utc: blocked.end_date.toISOString(),
      start_date_local: utcToLocal(blocked.start_date, timezone).toISOString(),
      end_date_local: utcToLocal(blocked.end_date, timezone).toISOString(),
      formatted_dates: {
        start: formatInTimezone(
          blocked.start_date,
          "dd/MM/yyyy HH:mm",
          timezone
        ),
        end: formatInTimezone(blocked.end_date, "dd/MM/yyyy HH:mm", timezone),
      },
      reason: blocked.reason as BlockedReason,
      duration_minutes: durationMinutes,
      createdAt: blocked.createdAt,
      updatedAt: blocked.updatedAt,
    };
  }
}
