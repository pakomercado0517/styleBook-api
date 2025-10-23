import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config();

// ==================== CONFIGURACIÓN ====================

interface SendGridConfig {
  apiKey: string;
  fromEmail: string;
}

interface TestEmailParams {
  toEmail: string;
}

// ==================== VALIDACIÓN DE CONFIGURACIÓN ====================

function validateConfig(): SendGridConfig {
  const { SENDGRID_API_KEY, SENDGRID_FROM_EMAIL } = process.env;

  if (!SENDGRID_API_KEY || !SENDGRID_FROM_EMAIL) {
    console.error("❌ Error: Faltan variables de entorno");
    console.log("SENDGRID_API_KEY existe:", !!SENDGRID_API_KEY);
    console.log("SENDGRID_FROM_EMAIL existe:", !!SENDGRID_FROM_EMAIL);
    throw new Error("Missing SendGrid configuration");
  }

  // Limpiar espacios extra
  const apiKeyTrimmed = SENDGRID_API_KEY.trim();
  const emailTrimmed = SENDGRID_FROM_EMAIL.trim();

  // Advertencias
  if (apiKeyTrimmed !== SENDGRID_API_KEY) {
    console.warn("⚠️  Advertencia: Tu API Key tiene espacios extra");
  }

  if (emailTrimmed !== SENDGRID_FROM_EMAIL) {
    console.warn("⚠️  Advertencia: Tu email tiene espacios extra");
  }

  // Validaciones
  if (!apiKeyTrimmed.startsWith("SG.")) {
    throw new Error("La API Key debe comenzar con 'SG.'");
  }

  if (!emailTrimmed.includes("@")) {
    throw new Error("El email no tiene formato válido");
  }

  return {
    apiKey: apiKeyTrimmed,
    fromEmail: emailTrimmed,
  };
}

// ==================== INICIALIZACIÓN ====================

let config: SendGridConfig;

try {
  config = validateConfig();
  sgMail.setApiKey(config.apiKey);
  console.log("✅ SendGrid configurado correctamente");
} catch (error) {
  console.error("❌ Error configurando SendGrid:", error);
  throw error;
}

// ==================== FUNCIÓN DE PRUEBA ====================

/**
 * Envía un email de prueba para verificar la configuración
 */
export async function sendTestEmail(params: TestEmailParams): Promise<void> {
  const msg = {
    to: params.toEmail,
    from: config.fromEmail,
    subject: "Email de prueba - StyleBook",
    text: "Hola, este es un correo para probar los envios de correo en la plataforma",
    html: "<strong>Hola, este es un correo para probar los envios de correo en la plataforma StyleBook</strong>",
  };

  console.log("🔍 Intentando enviar email de prueba...");
  console.log("📧 Desde:", config.fromEmail);
  console.log("📧 Para:", params.toEmail);
  console.log("🔑 API Key:", config.apiKey.substring(0, 10) + "...");

  try {
    await sgMail.send(msg);
    console.log("✅ Email de prueba enviado exitosamente!");
  } catch (error: unknown) {
    const err = error as {
      code?: number;
      message?: string;
      response?: { body?: unknown };
    };
    console.error("❌ Error al enviar el correo:");
    console.error("Código de estado:", err.code);
    console.error("Mensaje:", err.message);
    if (err.response) {
      console.error("Detalles del error:", err.response.body);
    }
    throw error;
  }
}

// ==================== EXPORTACIONES ====================

export { config as sendGridConfig };
export default sgMail;
