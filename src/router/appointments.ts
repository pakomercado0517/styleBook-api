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

export default router;
