/**
 * dateUtils.ts - Utilidades para manejo de fechas y timezones
 *
 * Estrategia: UTC en Base de Datos, Timezone en Aplicación
 * - BD siempre en UTC
 * - Conversión manual al timezone del usuario para entrada/salida
 * - Validación robusta de fechas
 */

import { parseISO, isValid, differenceInMinutes } from "date-fns";
import { format, toZonedTime, fromZonedTime } from "date-fns-tz";

const DEFAULT_TIMEZONE = "America/Mexico_City";

/**
 * ✅ UTC → Local (para mostrar al usuario)
 */
export function utcToLocal(
  utcDate: string | Date,
  timezone: string = DEFAULT_TIMEZONE
): Date {
  const date = typeof utcDate === "string" ? parseISO(utcDate) : utcDate;

  if (!isValid(date)) {
    throw new InvalidDateError(`Invalid date: ${utcDate}`);
  }

  return toZonedTime(date, timezone);
}

/**
 * ✅ Local → UTC (para guardar en BD)
 */
export function localToUtc(
  localDate: string | Date,
  timezone: string = DEFAULT_TIMEZONE
): Date {
  const date = typeof localDate === "string" ? parseISO(localDate) : localDate;

  if (!isValid(date)) {
    throw new InvalidDateError(`Invalid date: ${localDate}`);
  }

  return fromZonedTime(date, timezone);
}

/**
 * ✅ Formatear fecha en timezone específico
 */
export function formatInTimezone(
  date: string | Date,
  pattern: string = "yyyy-MM-dd HH:mm:ss",
  timezone: string = DEFAULT_TIMEZONE
): string {
  const parsedDate = typeof date === "string" ? parseISO(date) : date;

  if (!isValid(parsedDate)) {
    throw new InvalidDateError(`Invalid date: ${date}`);
  }

  return format(parsedDate, pattern, { timeZone: timezone });
}

/**
 * ✅ Calcular diferencia en minutos
 */
export function getDurationMinutes(start: Date, end: Date): number {
  if (!isValid(start) || !isValid(end)) {
    throw new InvalidDateError("Invalid dates");
  }

  const duration = differenceInMinutes(end, start);

  if (duration < 0) {
    throw new InvalidDateRangeError("End must be after start");
  }

  return duration;
}

/**
 * ✅ Validar sobreposición de fechas
 */
export function datesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 < end2 && start2 < end1;
}

// CUSTOM ERRORS
export class DateConversionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DateConversionError";
  }
}

export class InvalidDateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidDateError";
  }
}

export class InvalidDateRangeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidDateRangeError";
  }
}
