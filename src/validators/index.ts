import { body, param, query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

/**
 * Middleware para manejar errores de validación
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      status: 400,
      message: "Validation errors",
      errors: errors.array().map((error) => ({
        field: "param" in error ? error.param : error.msg,
        message: error.msg,
      })),
    });
    return;
  }
  next();
};

// ============================================
// AUTH VALIDATORS
// ============================================

export const authValidators = {
  register: [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),

    body("apellido")
      .trim()
      .notEmpty()
      .withMessage("Last name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be between 2 and 50 characters"),

    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("Password must contain uppercase, lowercase, and numbers"),

    body("role")
      .notEmpty()
      .withMessage("Role is required")
      .isIn(["client", "provider", "admin"])
      .withMessage("Role must be client, provider, or admin"),
  ],

  login: [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],

  changePassword: [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required")
      .isLength({ min: 8 })
      .withMessage("Current password must be at least 8 characters"),

    body("newPassword")
      .notEmpty()
      .withMessage("New password is required")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "New password must contain uppercase, lowercase, and numbers"
      ),
  ],
};

// ============================================
// USERS VALIDATORS
// ============================================

export const userValidators = {
  update: [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),

    body("apellido")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be between 2 and 50 characters"),

    body("phone")
      .optional()
      .trim()
      .matches(/^[0-9\-\+\(\)\s]+$/)
      .withMessage("Invalid phone format"),

    body("avatar_url")
      .optional()
      .trim()
      .isURL()
      .withMessage("Invalid avatar URL"),

    body("timezone")
      .optional()
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage("Invalid timezone format"),
  ],

  getPaginated: [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),

    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),

    query("role")
      .optional()
      .isIn(["client", "provider", "admin"])
      .withMessage("Invalid role"),
  ],

  getById: [
    param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),
  ],

  delete: [
    param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),
  ],
};

// ============================================
// APPOINTMENTS VALIDATORS
// ============================================

export const appointmentValidators = {
  create: [
    body("service_id")
      .notEmpty()
      .withMessage("Service ID is required")
      .isInt({ min: 1 })
      .withMessage("Service ID must be a positive integer"),

    body("employee_id")
      .notEmpty()
      .withMessage("Employee ID is required")
      .isInt({ min: 1 })
      .withMessage("Employee ID must be a positive integer"),

    body("start_date")
      .notEmpty()
      .withMessage("Start date is required")
      .isISO8601()
      .withMessage("Start date must be a valid ISO 8601 date"),

    body("end_date")
      .notEmpty()
      .withMessage("End date is required")
      .isISO8601()
      .withMessage("End date must be a valid ISO 8601 date"),
  ],

  update: [
    param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),

    body("status")
      .optional()
      .isIn(["pending", "confirmed", "completed", "cancelled", "no_show"])
      .withMessage(
        "Status must be one of: pending, confirmed, completed, cancelled, no_show"
      ),

    body("notes")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Notes must not exceed 500 characters"),
  ],

  getPaginated: [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),

    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],

  getById: [
    param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),
  ],

  delete: [
    param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),
  ],
};

// ============================================
// REVIEWS VALIDATORS
// ============================================

export const reviewValidators = {
  create: [
    body("appointment_id")
      .notEmpty()
      .withMessage("Appointment ID is required")
      .isInt({ min: 1 })
      .withMessage("Appointment ID must be a positive integer"),

    body("rating")
      .notEmpty()
      .withMessage("Rating is required")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),

    body("comment")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Comment must not exceed 1000 characters"),
  ],

  update: [
    param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),

    body("rating")
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),

    body("comment")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Comment must not exceed 1000 characters"),

    body("provider_response")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Provider response must not exceed 1000 characters"),
  ],

  getPaginated: [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),

    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],

  getProviderReviews: [
    param("provider_id")
      .isInt({ min: 1 })
      .withMessage("Provider ID must be a positive integer"),

    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),

    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],

  getById: [
    param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),
  ],

  delete: [
    param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),
  ],
};

// ============================================
// BLOCKED HOURS VALIDATORS
// ============================================

export const blockedHoursValidators = {
  create: [
    body("start_date")
      .notEmpty()
      .withMessage("Start date is required")
      .isISO8601()
      .withMessage("Start date must be a valid ISO 8601 date"),

    body("end_date")
      .notEmpty()
      .withMessage("End date is required")
      .isISO8601()
      .withMessage("End date must be a valid ISO 8601 date"),

    body("reason")
      .notEmpty()
      .withMessage("Reason is required")
      .isIn(["vacation", "sick_leave", "maintenance", "break", "other"])
      .withMessage(
        "Reason must be one of: vacation, sick_leave, maintenance, break, other"
      ),

    body("provider_id")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Provider ID must be a positive integer"),

    body("employee_id")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Employee ID must be a positive integer"),
  ],

  update: [
    param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),

    body("start_date")
      .optional()
      .isISO8601()
      .withMessage("Start date must be a valid ISO 8601 date"),

    body("end_date")
      .optional()
      .isISO8601()
      .withMessage("End date must be a valid ISO 8601 date"),

    body("reason")
      .optional()
      .isIn(["vacation", "sick_leave", "maintenance", "break", "other"])
      .withMessage(
        "Reason must be one of: vacation, sick_leave, maintenance, break, other"
      ),
  ],

  getPaginated: [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),

    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],

  getProviderBlockedHours: [
    param("provider_id")
      .isInt({ min: 1 })
      .withMessage("Provider ID must be a positive integer"),

    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),

    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],

  getEmployeeBlockedHours: [
    param("employee_id")
      .isInt({ min: 1 })
      .withMessage("Employee ID must be a positive integer"),

    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),

    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],

  getByDateRange: [
    query("provider_id")
      .notEmpty()
      .withMessage("Provider ID is required")
      .isInt({ min: 1 })
      .withMessage("Provider ID must be a positive integer"),

    query("start_date")
      .notEmpty()
      .withMessage("Start date is required")
      .isISO8601()
      .withMessage("Start date must be a valid ISO 8601 date"),

    query("end_date")
      .notEmpty()
      .withMessage("End date is required")
      .isISO8601()
      .withMessage("End date must be a valid ISO 8601 date"),
  ],

  getById: [
    param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),
  ],

  delete: [
    param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),
  ],
};

// ============================================
// PROVIDERS VALIDATORS
// ============================================

export const providerValidators = {
  create: [
    body("business_name")
      .trim()
      .notEmpty()
      .withMessage("Business name is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Business name must be between 2 and 100 characters"),

    body("business_type")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Business type must be between 2 and 50 characters"),

    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Description must not exceed 1000 characters"),

    body("city")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("City must be between 2 and 50 characters"),
  ],

  update: [
    param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),

    body("business_name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Business name must be between 2 and 100 characters"),

    body("business_type")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Business type must be between 2 and 50 characters"),

    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Description must not exceed 1000 characters"),
  ],

  getById: [
    param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),
  ],

  delete: [
    param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),
  ],
};

// ============================================
// SERVICES VALIDATORS
// ============================================

export const serviceValidators = {
  create: [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Service name is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Service name must be between 2 and 100 characters"),

    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description must not exceed 500 characters"),

    body("price")
      .notEmpty()
      .withMessage("Price is required")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),

    body("duration_minutes")
      .notEmpty()
      .withMessage("Duration is required")
      .isInt({ min: 1 })
      .withMessage("Duration must be a positive integer"),

    body("provider_id")
      .notEmpty()
      .withMessage("Provider ID is required")
      .isInt({ min: 1 })
      .withMessage("Provider ID must be a positive integer"),
  ],

  update: [
    param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),

    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Service name must be between 2 and 100 characters"),

    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description must not exceed 500 characters"),

    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),

    body("duration_minutes")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Duration must be a positive integer"),
  ],

  getById: [
    param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),
  ],

  delete: [
    param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),
  ],
};
