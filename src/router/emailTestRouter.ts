import { Router } from "express";
import emailTestController from "../controllers/EmailTestController";
import { authenticate } from "../middlewares/auth.middleware";

const router: Router = Router();

/**
 * 📧 EMAIL TESTING ROUTES
 *
 * ⚠️ IMPORTANTE: Estas rutas son para desarrollo/testing únicamente
 * En producción, los emails se envían automáticamente desde otros controllers
 *
 * Todas las rutas requieren autenticación
 */

// Test de configuración básico
router.post(
  "/test",
  authenticate,
  emailTestController.testConfiguration.bind(emailTestController)
);

// Test de email de verificación
router.post(
  "/verification",
  authenticate,
  emailTestController.testVerificationEmail.bind(emailTestController)
);

// Test de email de recuperación de contraseña
router.post(
  "/password-reset",
  authenticate,
  emailTestController.testPasswordResetEmail.bind(emailTestController)
);

// Test de email de confirmación de cita
router.post(
  "/appointment-confirmation",
  authenticate,
  emailTestController.testAppointmentConfirmation.bind(emailTestController)
);

// Test de email de cancelación de cita
router.post(
  "/appointment-cancellation",
  authenticate,
  emailTestController.testAppointmentCancellation.bind(emailTestController)
);

// Test de email de recordatorio de cita
router.post(
  "/appointment-reminder",
  authenticate,
  emailTestController.testAppointmentReminder.bind(emailTestController)
);

// Test de notificación de nueva cita (proveedor)
router.post(
  "/new-appointment-notification",
  authenticate,
  emailTestController.testNewAppointmentNotification.bind(emailTestController)
);

// Test de notificación de nueva reseña (proveedor)
router.post(
  "/review-notification",
  authenticate,
  emailTestController.testReviewNotification.bind(emailTestController)
);

export default router;
