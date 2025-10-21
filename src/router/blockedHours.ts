import express, { Request, Response, NextFunction } from "express";
import { BlockedHoursController } from "../controllers/BlockedHoursController";
import { authenticate } from "../middlewares";
import { blockedHoursValidators, handleValidationErrors } from "../validators";

const router = express.Router();
const blockedHoursController = new BlockedHoursController();

/**
 * POST /blocked-hours
 * Crear nuevo horario bloqueado
 * Headers: Authorization: Bearer {token}
 * Body: { start_date, end_date, reason, provider_id?, employee_id? }
 */
router.post(
  "/",
  authenticate,
  blockedHoursValidators.create,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    blockedHoursController.createBlockedHours(req, res, next)
);

/**
 * GET /blocked-hours/provider/:provider_id
 * Obtener horarios bloqueados de un proveedor
 * Query: ?page=1&limit=20
 */
router.get(
  "/provider/:provider_id",
  blockedHoursValidators.getProviderBlockedHours,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    blockedHoursController.getProviderBlockedHours(req, res, next)
);

/**
 * GET /blocked-hours/employee/:employee_id
 * Obtener horarios bloqueados de un empleado
 * Query: ?page=1&limit=20
 */
router.get(
  "/employee/:employee_id",
  blockedHoursValidators.getEmployeeBlockedHours,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    blockedHoursController.getEmployeeBlockedHours(req, res, next)
);

/**
 * GET /blocked-hours/date-range/search
 * Obtener horarios bloqueados en un rango de fechas
 * Query: ?provider_id=7&start_date=2025-10-25&end_date=2025-11-25
 */
router.get(
  "/date-range/search",
  blockedHoursValidators.getByDateRange,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    blockedHoursController.getBlockedHoursByDateRange(req, res, next)
);

/**
 * GET /blocked-hours/:id
 * Obtener un horario bloqueado específico
 */
router.get(
  "/:id",
  blockedHoursValidators.getById,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    blockedHoursController.getBlockedHoursById(req, res, next)
);

/**
 * PUT /blocked-hours/:id
 * Actualizar un horario bloqueado
 * Headers: Authorization: Bearer {token}
 * Body: { start_date?, end_date?, reason? }
 */
router.put(
  "/:id",
  authenticate,
  blockedHoursValidators.update,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    blockedHoursController.updateBlockedHours(req, res, next)
);

/**
 * DELETE /blocked-hours/:id
 * Eliminar un horario bloqueado
 * Headers: Authorization: Bearer {token}
 */
router.delete(
  "/:id",
  authenticate,
  blockedHoursValidators.delete,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    blockedHoursController.deleteBlockedHours(req, res, next)
);

export default router;
