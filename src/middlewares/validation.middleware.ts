import { Request, Response, NextFunction } from "express";
import { validationResult, body, param, query } from "express-validator";
import { ValidationError } from "../utils/errors";

// Middleware para procesar errores de validación
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((err: any) => `${err.param}: ${err.msg}`)
      .join(", ");
    throw new ValidationError(errorMessages);
  }
  next();
};

// Validadores reutilizables
export const validators = {
  // User/Auth
  registerUser: [
    body("name").trim().notEmpty().withMessage("Nombre requerido"),
    body("apellido").trim().notEmpty().withMessage("Apellido requerido"),
    body("email").isEmail().withMessage("Email inválido"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password mínimo 6 caracteres"),
    body("role")
      .isIn(["client", "provider", "admin"])
      .withMessage("Rol inválido"),
  ],

  loginUser: [
    body("email").isEmail().withMessage("Email inválido"),
    body("password").notEmpty().withMessage("Password requerido"),
  ],

  updateUser: [
    body("name")
      .trim()
      .optional()
      .notEmpty()
      .withMessage("Nombre no puede estar vacío"),
    body("apellido")
      .trim()
      .optional()
      .notEmpty()
      .withMessage("Apellido no puede estar vacío"),
    body("phone").trim().optional(),
    body("avatar_url").trim().optional().isURL().withMessage("URL inválida"),
    body("timezone")
      .optional()
      .isString()
      .withMessage("Timezone debe ser string"),
  ],

  // Providers
  createProvider: [
    body("business_name")
      .trim()
      .notEmpty()
      .withMessage("Nombre del negocio requerido"),
    body("business_type").trim().optional(),
    body("description").trim().optional(),
  ],

  // Services
  createService: [
    body("name").trim().notEmpty().withMessage("Nombre del servicio requerido"),
    body("duration_minutes")
      .isInt({ min: 15 })
      .withMessage("Duración mínimo 15 minutos"),
    body("price").isDecimal().withMessage("Precio debe ser un número decimal"),
    body("category")
      .notEmpty()
      .withMessage("Categoría requerida")
      .isIn([
        "corte",
        "tinte",
        "peinado",
        "manicure",
        "pedicure",
        "tratamiento_capilar",
        "barba",
        "afeitado",
        "masaje",
        "facial",
        "corporal",
        "aromaterapia",
        "limpieza_dental",
        "estetica_dental",
        "asesoria",
      ])
      .withMessage("Categoría inválida"),
  ],

  // Appointments
  createAppointment: [
    body("service_id").isInt().withMessage("Service ID inválido"),
    body("provider_id").isInt().withMessage("Provider ID inválido"),
    body("start_date").isISO8601().withMessage("Fecha inicio inválida"),
    body("end_date").isISO8601().withMessage("Fecha fin inválida"),
  ],

  // ID validation
  validateId: [param("id").isInt().withMessage("ID debe ser un número")],

  // Pagination
  paginationQuery: [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page debe ser >= 1"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit debe estar entre 1-100"),
  ],
};
