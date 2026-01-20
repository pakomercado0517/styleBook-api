import * as brevo from "@getbrevo/brevo";
import dotenv from "dotenv";
dotenv.config();

// ==================== CONFIGURACIÓN ====================

interface BrevoConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

interface TestEmailParams {
  toEmail: string;
}

// ==================== VALIDACIÓN DE CONFIGURACIÓN ====================

function validateConfig(): BrevoConfig {
  const { BREVO_API_KEY, BREVO_FROM_EMAIL, BREVO_FROM_NAME } = process.env;

  if (!BREVO_API_KEY || !BREVO_FROM_EMAIL) {
    console.error("❌ Error: Faltan variables de entorno");
    console.log("BREVO_API_KEY existe:", !!BREVO_API_KEY);
    console.log("BREVO_FROM_EMAIL existe:", !!BREVO_FROM_EMAIL);
    throw new Error("Missing Brevo configuration");
  }

  // Limpiar espacios extra
  const apiKeyTrimmed = BREVO_API_KEY.trim();
  const emailTrimmed = BREVO_FROM_EMAIL.trim();
  const nameTrimmed = (BREVO_FROM_NAME || "StyleBook").trim();

  // Advertencias
  if (apiKeyTrimmed !== BREVO_API_KEY) {
    console.warn("⚠️  Advertencia: Tu API Key tiene espacios extra");
  }

  if (emailTrimmed !== BREVO_FROM_EMAIL) {
    console.warn("⚠️  Advertencia: Tu email tiene espacios extra");
  }

  // Validaciones
  if (!apiKeyTrimmed.startsWith("xkeysib-")) {
    console.warn(
      "⚠️  Advertencia: La API Key normalmente comienza con 'xkeysib-'"
    );
  }

  if (!emailTrimmed.includes("@")) {
    throw new Error("El email no tiene formato válido");
  }

  return {
    apiKey: apiKeyTrimmed,
    fromEmail: emailTrimmed,
    fromName: nameTrimmed,
  };
}

// ==================== INICIALIZACIÓN ====================

let config: BrevoConfig;

try {
  config = validateConfig();
  console.log("✅ Brevo configurado correctamente");
  console.log("📧 Email remitente:", config.fromEmail);
  console.log("👤 Nombre remitente:", config.fromName);
} catch (error) {
  console.error("❌ Error configurando Brevo:", error);
  throw error;
}

// ==================== FUNCIÓN DE PRUEBA ====================

/**
 * Envía un email de prueba para verificar la configuración
 */
export async function sendTestEmail(params: TestEmailParams): Promise<void> {
  try {
    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      config.apiKey
    );

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = {
      email: config.fromEmail,
      name: config.fromName,
    };
    sendSmtpEmail.to = [{ email: params.toEmail }];
    sendSmtpEmail.subject = "Email de prueba - StyleBook";
    sendSmtpEmail.htmlContent =
      "<strong>Hola, este es un correo para probar los envios de correo en la plataforma StyleBook</strong>";
    sendSmtpEmail.textContent =
      "Hola, este es un correo para probar los envios de correo en la plataforma StyleBook";

    console.log("🔍 Intentando enviar email de prueba...");
    console.log("📧 Desde:", config.fromEmail, `(${config.fromName})`);
    console.log("📧 Para:", params.toEmail);

    await apiInstance.sendTransacEmail(sendSmtpEmail);
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

export { config as brevoConfig };
export { brevo };

