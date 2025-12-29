import express, { Request, Response, NextFunction } from "express";
import { AppointmentController } from "../controllers/AppointmentController";
import { authenticate } from "../middlewares";
import { appointmentValidators, handleValidationErrors } from "../validators";

const router = express.Router();
const appointmentController = new AppointmentController();

/**
 * POST /appointments
 * Crear una nueva cita
 * Headers: Authorization: Bearer {token}
 * Body: { service_id, employee_id, start_date, end_date }
 */
router.post(
  "/",
  authenticate,
  appointmentValidators.create,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    appointmentController.createAppointment(req, res, next)
);

/**
 * GET /appointments
 * Obtener todas las citas del cliente autenticado
 * Headers: Authorization: Bearer {token}
 * Query: ?page=1&limit=20
 */
router.get(
  "/",
  authenticate,
  appointmentValidators.getPaginated,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    appointmentController.getClientAppointments(req, res, next)
);

/**
 * GET /appointments/:id
 * Obtener una cita específica
 * Headers: Authorization: Bearer {token}
 */
router.get(
  "/:id",
  authenticate,
  appointmentValidators.getById,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    appointmentController.getAppointmentById(req, res, next)
);

/**
 * PUT /appointments/:id
 * Actualizar estado o notas de una cita
 * Headers: Authorization: Bearer {token}
 * Body: { status?, notes? }
 */
router.put(
  "/:id",
  authenticate,
  appointmentValidators.update,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    appointmentController.updateAppointment(req, res, next)
);

/**
 * PUT /appointments/:id/reschedule
 * Reagendar una cita (cambiar fecha/hora y opcionalmente empleado)
 * Headers: Authorization: Bearer {token}
 * Body: { start_date, end_date, employee_id? }
 */
router.put(
  "/:id/reschedule",
  authenticate,
  appointmentValidators.reschedule,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    appointmentController.rescheduleAppointment(req, res, next)
);

/**
 * DELETE /appointments/:id
 * Cancelar una cita
 * Headers: Authorization: Bearer {token}
 */
router.delete(
  "/:id",
  authenticate,
  appointmentValidators.delete,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    appointmentController.cancelAppointment(req, res, next)
);

/**
 * POST /appointments/:id/confirm
 * Confirmar una cita (solo proveedor)
 * Headers: Authorization: Bearer {token}
 */
router.post(
  "/:id/confirm",
  authenticate,
  appointmentValidators.getById,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    appointmentController.confirmAppointment(req, res, next)
);

/**
 * GET /appointments/provider/pending
 * Obtener citas pendientes del proveedor autenticado
 * Headers: Authorization: Bearer {token}
 * Query: ?limit=20&offset=0
 */
router.get(
  "/provider/pending",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    appointmentController.getProviderPendingAppointments(req, res, next)
);

/**
 * GET /appointments/provider/all
 * Obtener todas las citas del proveedor autenticado
 * Headers: Authorization: Bearer {token}
 * Query: ?status=confirmed&limit=20&offset=0&start_date=2025-01-01&end_date=2025-01-31
 * 
 * Parámetros opcionales:
 * - status: pending | confirmed | completed | cancelled | no_show
 * - limit: número de resultados por página (default: 20, max: 100)
 * - offset: número de resultados a saltar (default: 0)
 * - employee_id: filtrar por ID de empleado
 * - start_date: fecha de inicio del período (ISO 8601, ej: "2025-01-01" o "2025-01-01T00:00:00Z")
 * - end_date: fecha de fin del período (ISO 8601, ej: "2025-01-31" o "2025-01-31T23:59:59Z")
 */
router.get(
  "/provider/all",
  authenticate,
  (req: Request, res: Response, next: NextFunction) =>
    appointmentController.getProviderAppointments(req, res, next)
);

export default router;
