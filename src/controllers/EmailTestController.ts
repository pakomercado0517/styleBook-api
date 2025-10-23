import { Request, Response, NextFunction } from "express";
import emailService from "../services/EmailService";
import { sendTestEmail } from "../config/sendgrid";

/**
 * Controller para testing de emails
 * ⚠️ IMPORTANTE: Este controller es solo para desarrollo/testing
 * En producción, los emails se envían automáticamente desde otros controllers
 */
export class EmailTestController {
  /**
   * Test básico de configuración de SendGrid
   * POST /emails/test
   */
  async testConfiguration(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { toEmail }: { toEmail: string } = req.body;

      if (!toEmail) {
        res.status(400).json({
          success: false,
          message: "El campo toEmail es requerido",
        });
        return;
      }

      await sendTestEmail({ toEmail });

      res.status(200).json({
        success: true,
        message: `Email de prueba enviado a ${toEmail}`,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Test de email de verificación
   * POST /emails/verification
   */
  async testVerificationEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        toEmail,
        userName,
        verificationToken,
      }: {
        toEmail: string;
        userName: string;
        verificationToken: string;
      } = req.body;

      if (!toEmail || !userName || !verificationToken) {
        res.status(400).json({
          success: false,
          message: "Campos requeridos: toEmail, userName, verificationToken",
        });
        return;
      }

      await emailService.sendVerificationEmail({
        toEmail,
        userName,
        verificationToken,
      });

      res.status(200).json({
        success: true,
        message: `Email de verificación enviado a ${toEmail}`,
        data: {
          template: "verification",
          recipient: toEmail,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Test de email de recuperación de contraseña
   * POST /emails/password-reset
   */
  async testPasswordResetEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        toEmail,
        userName,
        resetToken,
      }: {
        toEmail: string;
        userName: string;
        resetToken: string;
      } = req.body;

      if (!toEmail || !userName || !resetToken) {
        res.status(400).json({
          success: false,
          message: "Campos requeridos: toEmail, userName, resetToken",
        });
        return;
      }

      await emailService.sendPasswordResetEmail({
        toEmail,
        userName,
        resetToken,
      });

      res.status(200).json({
        success: true,
        message: `Email de recuperación enviado a ${toEmail}`,
        data: {
          template: "password-reset",
          recipient: toEmail,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Test de email de confirmación de cita
   * POST /emails/appointment-confirmation
   */
  async testAppointmentConfirmation(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        toEmail,
        clientName,
        providerName,
        serviceName,
        appointmentDate,
        appointmentTime,
        timezone,
        location,
        price,
      }: {
        toEmail: string;
        clientName: string;
        providerName: string;
        serviceName: string;
        appointmentDate: string;
        appointmentTime: string;
        timezone: string;
        location: string;
        price: number;
      } = req.body;

      if (
        !toEmail ||
        !clientName ||
        !providerName ||
        !serviceName ||
        !appointmentDate ||
        !appointmentTime ||
        !timezone ||
        !location ||
        price === undefined
      ) {
        res.status(400).json({
          success: false,
          message:
            "Campos requeridos: toEmail, clientName, providerName, serviceName, appointmentDate, appointmentTime, timezone, location, price",
        });
        return;
      }

      await emailService.sendAppointmentConfirmation({
        toEmail,
        clientName,
        providerName,
        serviceName,
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        timezone,
        location,
        price,
      });

      res.status(200).json({
        success: true,
        message: `Email de confirmación de cita enviado a ${toEmail}`,
        data: {
          template: "appointment-confirmation",
          recipient: toEmail,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Test de email de cancelación de cita
   * POST /emails/appointment-cancellation
   */
  async testAppointmentCancellation(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        toEmail,
        clientName,
        providerName,
        serviceName,
        appointmentDate,
        appointmentTime,
        timezone,
        cancellationReason,
      }: {
        toEmail: string;
        clientName: string;
        providerName: string;
        serviceName: string;
        appointmentDate: string;
        appointmentTime: string;
        timezone: string;
        cancellationReason?: string;
      } = req.body;

      if (
        !toEmail ||
        !clientName ||
        !providerName ||
        !serviceName ||
        !appointmentDate ||
        !appointmentTime ||
        !timezone
      ) {
        res.status(400).json({
          success: false,
          message:
            "Campos requeridos: toEmail, clientName, providerName, serviceName, appointmentDate, appointmentTime, timezone",
        });
        return;
      }

      await emailService.sendAppointmentCancellation({
        toEmail,
        clientName,
        providerName,
        serviceName,
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        timezone,
        cancellationReason,
      });

      res.status(200).json({
        success: true,
        message: `Email de cancelación enviado a ${toEmail}`,
        data: {
          template: "appointment-cancellation",
          recipient: toEmail,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Test de email de recordatorio de cita
   * POST /emails/appointment-reminder
   */
  async testAppointmentReminder(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        toEmail,
        clientName,
        providerName,
        serviceName,
        appointmentDate,
        appointmentTime,
        timezone,
        location,
      }: {
        toEmail: string;
        clientName: string;
        providerName: string;
        serviceName: string;
        appointmentDate: string;
        appointmentTime: string;
        timezone: string;
        location: string;
      } = req.body;

      if (
        !toEmail ||
        !clientName ||
        !providerName ||
        !serviceName ||
        !appointmentDate ||
        !appointmentTime ||
        !timezone ||
        !location
      ) {
        res.status(400).json({
          success: false,
          message:
            "Campos requeridos: toEmail, clientName, providerName, serviceName, appointmentDate, appointmentTime, timezone, location",
        });
        return;
      }

      await emailService.sendAppointmentReminder({
        toEmail,
        clientName,
        providerName,
        serviceName,
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        timezone,
        location,
      });

      res.status(200).json({
        success: true,
        message: `Email de recordatorio enviado a ${toEmail}`,
        data: {
          template: "appointment-reminder",
          recipient: toEmail,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Test de email de notificación de nueva cita (proveedor)
   * POST /emails/new-appointment-notification
   */
  async testNewAppointmentNotification(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        toEmail,
        providerName,
        clientName,
        serviceName,
        appointmentDate,
        appointmentTime,
        timezone,
      }: {
        toEmail: string;
        providerName: string;
        clientName: string;
        serviceName: string;
        appointmentDate: string;
        appointmentTime: string;
        timezone: string;
      } = req.body;

      if (
        !toEmail ||
        !providerName ||
        !clientName ||
        !serviceName ||
        !appointmentDate ||
        !appointmentTime ||
        !timezone
      ) {
        res.status(400).json({
          success: false,
          message:
            "Campos requeridos: toEmail, providerName, clientName, serviceName, appointmentDate, appointmentTime, timezone",
        });
        return;
      }

      await emailService.sendNewAppointmentNotification({
        toEmail,
        providerName,
        clientName,
        serviceName,
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        timezone,
      });

      res.status(200).json({
        success: true,
        message: `Notificación de nueva cita enviada a ${toEmail}`,
        data: {
          template: "new-appointment-notification",
          recipient: toEmail,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Test de email de notificación de nueva reseña (proveedor)
   * POST /emails/review-notification
   */
  async testReviewNotification(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        toEmail,
        providerName,
        clientName,
        serviceName,
        rating,
        comment,
        reviewDate,
        timezone,
      }: {
        toEmail: string;
        providerName: string;
        clientName: string;
        serviceName: string;
        rating: number;
        comment: string;
        reviewDate: string;
        timezone: string;
      } = req.body;

      if (
        !toEmail ||
        !providerName ||
        !clientName ||
        !serviceName ||
        rating === undefined ||
        !comment ||
        !reviewDate ||
        !timezone
      ) {
        res.status(400).json({
          success: false,
          message:
            "Campos requeridos: toEmail, providerName, clientName, serviceName, rating, comment, reviewDate, timezone",
        });
        return;
      }

      if (rating < 1 || rating > 5) {
        res.status(400).json({
          success: false,
          message: "El rating debe estar entre 1 y 5",
        });
        return;
      }

      await emailService.sendNewReviewNotification({
        toEmail,
        providerName,
        clientName,
        serviceName,
        rating,
        comment,
        reviewDate: new Date(reviewDate),
        timezone,
      });

      res.status(200).json({
        success: true,
        message: `Notificación de nueva reseña enviada a ${toEmail}`,
        data: {
          template: "review-notification",
          recipient: toEmail,
          rating,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new EmailTestController();
