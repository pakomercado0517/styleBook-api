import * as brevo from "@getbrevo/brevo";
import { formatInTimezone } from "../utils/dateUtils";

// ==================== TIPOS E INTERFACES ====================

interface EmailConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface VerificationEmailParams {
  toEmail: string;
  userName: string;
  verificationToken: string;
}

interface PasswordResetEmailParams {
  toEmail: string;
  userName: string;
  resetToken: string;
}

interface AppointmentConfirmationParams {
  toEmail: string;
  clientName: string;
  providerName: string;
  serviceName: string;
  appointmentDate: Date;
  appointmentTime: string;
  timezone: string;
  location: string;
  price: number;
}

interface AppointmentCancellationParams {
  toEmail: string;
  clientName: string;
  providerName: string;
  serviceName: string;
  appointmentDate: Date;
  appointmentTime: string;
  timezone: string;
  cancellationReason?: string;
}

interface AppointmentReminderParams {
  toEmail: string;
  clientName: string;
  providerName: string;
  serviceName: string;
  appointmentDate: Date;
  appointmentTime: string;
  timezone: string;
  location: string;
}

interface NewAppointmentNotificationParams {
  toEmail: string;
  providerName: string;
  clientName: string;
  serviceName: string;
  appointmentDate: Date;
  appointmentTime: string;
  timezone: string;
}

interface NewReviewNotificationParams {
  toEmail: string;
  providerName: string;
  clientName: string;
  serviceName: string;
  rating: number;
  comment: string;
  reviewDate: Date;
  timezone: string;
}

// ==================== CLASE EMAIL SERVICE ====================

export class EmailService {
  private _apiKey: string;
  private _fromEmail: string;
  private _fromName: string;
  private _frontendUrl: string;
  private _brevoApi: brevo.TransactionalEmailsApi;

  constructor(config: EmailConfig, frontendUrl: string) {
    this._apiKey = config.apiKey;
    this._fromEmail = config.fromEmail;
    this._fromName = config.fromName;
    this._frontendUrl = frontendUrl;

    // Inicializar API de Brevo
    this._brevoApi = new brevo.TransactionalEmailsApi();
    this._brevoApi.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      this._apiKey
    );
  }

  // ==================== MÉTODO BASE DE ENVÍO ====================

  private async _sendEmail(params: SendEmailParams): Promise<void> {
    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.sender = {
        email: this._fromEmail,
        name: this._fromName,
      };
      sendSmtpEmail.to = [{ email: params.to }];
      sendSmtpEmail.subject = params.subject;
      sendSmtpEmail.htmlContent = params.html;
      sendSmtpEmail.textContent = params.text || params.subject;

      await this._brevoApi.sendTransacEmail(sendSmtpEmail);
      console.log(`✅ Email enviado a ${params.to}: ${params.subject}`);
    } catch (error) {
      console.error(`❌ Error enviando email a ${params.to}:`, error);
      throw new Error(`Failed to send email: ${error}`);
    }
  }

  // ==================== TEMPLATES HTML ====================

  private _getBaseTemplate(content: string): string {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Poppins', sans-serif;
          background-color: #F5F5F0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #FFFFFF;
        }
        .header {
          background: linear-gradient(135deg, #2C2C2C 0%, #1A1A1A 100%);
          padding: 40px 20px;
          text-align: center;
        }
        .logo {
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          font-weight: 700;
          color: #D4AF37;
          margin: 0;
          letter-spacing: 2px;
        }
        .tagline {
          font-size: 14px;
          color: #F5F5F0;
          margin: 10px 0 0 0;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .content {
          padding: 40px 30px;
          color: #2C2C2C;
        }
        .title {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 700;
          color: #2C2C2C;
          margin: 0 0 20px 0;
        }
        .text {
          font-size: 16px;
          line-height: 1.6;
          color: #64748B;
          margin: 0 0 20px 0;
        }
        .highlight {
          color: #2C2C2C;
          font-weight: 600;
        }
        .button {
          display: inline-block;
          padding: 16px 40px;
          background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%);
          color: #1A1A1A;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          margin: 20px 0;
          transition: transform 0.2s;
        }
        .button:hover {
          transform: translateY(-2px);
        }
        .info-box {
          background-color: #F5F5F5;
          border-left: 4px solid #D4AF37;
          padding: 20px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #E5E5E5;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label {
          font-weight: 600;
          color: #2C2C2C;
        }
        .info-value {
          color: #64748B;
        }
        .divider {
          height: 1px;
          background: linear-gradient(to right, transparent, #D4AF37, transparent);
          margin: 30px 0;
        }
        .footer {
          background-color: #2C2C2C;
          padding: 30px 20px;
          text-align: center;
          color: #F5F5F0;
        }
        .footer-text {
          font-size: 14px;
          color: #F5F5F0;
          margin: 5px 0;
        }
        .footer-link {
          color: #D4AF37;
          text-decoration: none;
        }
        .stars {
          color: #FFD700;
          font-size: 20px;
          letter-spacing: 4px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">STYLEBOOK</h1>
          <p class="tagline">Elegancia y Estilo en Cada Cita</p>
        </div>
        ${content}
        <div class="footer">
          <p class="footer-text">© ${new Date().getFullYear()} StyleBook. Todos los derechos reservados.</p>
          <p class="footer-text">
            <a href="${this._frontendUrl}" class="footer-link">Visitar StyleBook</a>
          </p>
          <p class="footer-text" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(245, 245, 240, 0.1); font-size: 12px; color: #9CA3AF;">
            Desarrollado por <a href="https://tresadesign.com" class="footer-link" style="color: #D4AF37;">TresA Design</a>
          </p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  // ==================== MÉTODOS DE ENVÍO ====================

  /**
   * Envía email de verificación al registrarse
   */
  async sendVerificationEmail(params: VerificationEmailParams): Promise<void> {
    const verificationUrl = `${this._frontendUrl}/verify-email?token=${params.verificationToken}`;

    const content = `
      <div class="content">
        <h2 class="title">¡Bienvenido a StyleBook!</h2>
        <p class="text">
          Hola <span class="highlight">${params.userName}</span>,
        </p>
        <p class="text">
          Gracias por unirte a <strong>StyleBook</strong>, la plataforma premium para servicios de belleza y estilo.
        </p>
        <p class="text">
          Para completar tu registro y comenzar a disfrutar de nuestros servicios, por favor verifica tu dirección de correo electrónico:
        </p>
        <div style="text-align: center;">
          <a href="${verificationUrl}" class="button">Verificar Email</a>
        </div>
        <div class="divider"></div>
        <p class="text" style="font-size: 14px; color: #64748B;">
          Si no creaste esta cuenta, puedes ignorar este mensaje.
        </p>
      </div>
    `;

    await this._sendEmail({
      to: params.toEmail,
      subject: "Verifica tu cuenta de StyleBook",
      html: this._getBaseTemplate(content),
    });
  }

  /**
   * Envía email para recuperación de contraseña
   */
  async sendPasswordResetEmail(
    params: PasswordResetEmailParams
  ): Promise<void> {
    const resetUrl = `${this._frontendUrl}/reset-password?token=${params.resetToken}`;

    const content = `
      <div class="content">
        <h2 class="title">Recuperación de Contraseña</h2>
        <p class="text">
          Hola <span class="highlight">${params.userName}</span>,
        </p>
        <p class="text">
          Recibimos una solicitud para restablecer la contraseña de tu cuenta de StyleBook.
        </p>
        <p class="text">
          Haz clic en el siguiente botón para crear una nueva contraseña:
        </p>
        <div style="text-align: center;">
          <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
        </div>
        <div class="divider"></div>
        <p class="text" style="font-size: 14px; color: #64748B;">
          Este enlace expirará en 1 hora por seguridad. Si no solicitaste este cambio, puedes ignorar este mensaje.
        </p>
      </div>
    `;

    await this._sendEmail({
      to: params.toEmail,
      subject: "Recuperación de contraseña - StyleBook",
      html: this._getBaseTemplate(content),
    });
  }

  /**
   * Envía confirmación de cita al cliente
   */
  async sendAppointmentConfirmation(
    params: AppointmentConfirmationParams
  ): Promise<void> {
    const formattedDate = formatInTimezone(
      params.appointmentDate,
      "EEEE, dd 'de' MMMM 'de' yyyy",
      params.timezone
    );

    const content = `
      <div class="content">
        <h2 class="title">¡Tu Cita ha sido Confirmada!</h2>
        <p class="text">
          Hola <span class="highlight">${params.clientName}</span>,
        </p>
        <p class="text">
          Nos complace confirmar tu cita en <strong>${params.providerName}</strong>.
        </p>
        <div class="info-box">
          <div class="info-row">
            <span class="info-label">Servicio:</span>
            <span class="info-value">${params.serviceName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Fecha:</span>
            <span class="info-value">${formattedDate}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Hora:</span>
            <span class="info-value">${params.appointmentTime}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Ubicación:</span>
            <span class="info-value">${params.location}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Precio:</span>
            <span class="info-value">$${params.price.toFixed(2)}</span>
          </div>
        </div>
        <div style="text-align: center;">
          <a href="${this._frontendUrl}/appointments" class="button">Ver Mis Citas</a>
        </div>
        <div class="divider"></div>
        <p class="text" style="font-size: 14px; color: #64748B;">
          Por favor, llega 5 minutos antes de tu cita. Si necesitas cancelar o reprogramar, hazlo con al menos 24 horas de anticipación.
        </p>
      </div>
    `;

    await this._sendEmail({
      to: params.toEmail,
      subject: `Confirmación de cita en ${params.providerName}`,
      html: this._getBaseTemplate(content),
    });
  }

  /**
   * Envía notificación de cancelación de cita
   */
  async sendAppointmentCancellation(
    params: AppointmentCancellationParams
  ): Promise<void> {
    const formattedDate = formatInTimezone(
      params.appointmentDate,
      "EEEE, dd 'de' MMMM 'de' yyyy",
      params.timezone
    );

    const content = `
      <div class="content">
        <h2 class="title">Cita Cancelada</h2>
        <p class="text">
          Hola <span class="highlight">${params.clientName}</span>,
        </p>
        <p class="text">
          Tu cita en <strong>${params.providerName}</strong> ha sido cancelada.
        </p>
        <div class="info-box">
          <div class="info-row">
            <span class="info-label">Servicio:</span>
            <span class="info-value">${params.serviceName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Fecha:</span>
            <span class="info-value">${formattedDate}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Hora:</span>
            <span class="info-value">${params.appointmentTime}</span>
          </div>
          ${
            params.cancellationReason
              ? `
          <div class="info-row">
            <span class="info-label">Motivo:</span>
            <span class="info-value">${params.cancellationReason}</span>
          </div>
          `
              : ""
          }
        </div>
        <div style="text-align: center;">
          <a href="${this._frontendUrl}/providers" class="button">Buscar Otros Servicios</a>
        </div>
      </div>
    `;

    await this._sendEmail({
      to: params.toEmail,
      subject: `Cita cancelada - ${params.providerName}`,
      html: this._getBaseTemplate(content),
    });
  }

  /**
   * Envía recordatorio de cita próxima
   */
  async sendAppointmentReminder(
    params: AppointmentReminderParams
  ): Promise<void> {
    const formattedDate = formatInTimezone(
      params.appointmentDate,
      "EEEE, dd 'de' MMMM 'de' yyyy",
      params.timezone
    );

    const content = `
      <div class="content">
        <h2 class="title">Recordatorio de Cita</h2>
        <p class="text">
          Hola <span class="highlight">${params.clientName}</span>,
        </p>
        <p class="text">
          Te recordamos que tienes una cita próxima en <strong>${params.providerName}</strong>.
        </p>
        <div class="info-box">
          <div class="info-row">
            <span class="info-label">Servicio:</span>
            <span class="info-value">${params.serviceName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Fecha:</span>
            <span class="info-value">${formattedDate}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Hora:</span>
            <span class="info-value">${params.appointmentTime}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Ubicación:</span>
            <span class="info-value">${params.location}</span>
          </div>
        </div>
        <div style="text-align: center;">
          <a href="${this._frontendUrl}/appointments" class="button">Ver Detalles</a>
        </div>
        <div class="divider"></div>
        <p class="text" style="font-size: 14px; color: #64748B;">
          Te esperamos con el mejor servicio. Recuerda llegar 5 minutos antes.
        </p>
      </div>
    `;

    await this._sendEmail({
      to: params.toEmail,
      subject: `Recordatorio: Cita mañana en ${params.providerName}`,
      html: this._getBaseTemplate(content),
    });
  }

  /**
   * Notifica al proveedor sobre una nueva cita
   */
  async sendNewAppointmentNotification(
    params: NewAppointmentNotificationParams
  ): Promise<void> {
    const formattedDate = formatInTimezone(
      params.appointmentDate,
      "EEEE, dd 'de' MMMM 'de' yyyy",
      params.timezone
    );

    const content = `
      <div class="content">
        <h2 class="title">Nueva Cita Recibida</h2>
        <p class="text">
          Hola <span class="highlight">${params.providerName}</span>,
        </p>
        <p class="text">
          Has recibido una nueva solicitud de cita de <strong>${params.clientName}</strong>.
        </p>
        <div class="info-box">
          <div class="info-row">
            <span class="info-label">Cliente:</span>
            <span class="info-value">${params.clientName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Servicio:</span>
            <span class="info-value">${params.serviceName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Fecha:</span>
            <span class="info-value">${formattedDate}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Hora:</span>
            <span class="info-value">${params.appointmentTime}</span>
          </div>
        </div>
        <div style="text-align: center;">
          <a href="${this._frontendUrl}/provider/appointments" class="button">Gestionar Cita</a>
        </div>
        <div class="divider"></div>
        <p class="text" style="font-size: 14px; color: #64748B;">
          Por favor, confirma o rechaza esta cita lo antes posible.
        </p>
      </div>
    `;

    await this._sendEmail({
      to: params.toEmail,
      subject: "Nueva cita recibida - StyleBook",
      html: this._getBaseTemplate(content),
    });
  }

  /**
   * Notifica al proveedor sobre una nueva reseña
   */
  async sendNewReviewNotification(
    params: NewReviewNotificationParams
  ): Promise<void> {
    const formattedDate = formatInTimezone(
      params.reviewDate,
      "dd 'de' MMMM 'de' yyyy",
      params.timezone
    );

    const stars = "★".repeat(params.rating) + "☆".repeat(5 - params.rating);

    const content = `
      <div class="content">
        <h2 class="title">Nueva Reseña Recibida</h2>
        <p class="text">
          Hola <span class="highlight">${params.providerName}</span>,
        </p>
        <p class="text">
          <strong>${params.clientName}</strong> ha dejado una nueva reseña sobre tu servicio.
        </p>
        <div class="info-box">
          <div class="info-row">
            <span class="info-label">Servicio:</span>
            <span class="info-value">${params.serviceName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Calificación:</span>
            <span class="stars">${stars}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Fecha:</span>
            <span class="info-value">${formattedDate}</span>
          </div>
        </div>
        ${
          params.comment
            ? `
        <div style="background-color: #F5F5F5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #2C2C2C; font-style: italic; margin: 0;">
            "${params.comment}"
          </p>
        </div>
        `
            : ""
        }
        <div style="text-align: center;">
          <a href="${this._frontendUrl}/provider/reviews" class="button">Ver Todas las Reseñas</a>
        </div>
        <div class="divider"></div>
        <p class="text" style="font-size: 14px; color: #64748B;">
          Las reseñas positivas ayudan a atraer más clientes. ¡Sigue brindando un excelente servicio!
        </p>
      </div>
    `;

    await this._sendEmail({
      to: params.toEmail,
      subject: `Nueva reseña de ${params.rating} estrellas - StyleBook`,
      html: this._getBaseTemplate(content),
    });
  }
}

// ==================== EXPORTAR INSTANCIA CONFIGURADA ====================

const emailService = new EmailService(
  {
    apiKey: process.env.BREVO_API_KEY || "",
    fromEmail: process.env.BREVO_FROM_EMAIL || "",
    fromName: process.env.BREVO_FROM_NAME || "StyleBook",
  },
  process.env.FRONTEND_URL || "http://localhost:3000"
);

export default emailService;
