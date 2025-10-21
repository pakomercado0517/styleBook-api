// Clase base para todos los errores de la app
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string = "ERROR"
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

// Errores específicos
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export class AuthError extends AppError {
  constructor(message: string = "No autorizado") {
    super(message, 401, "AUTH_ERROR");
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Recurso no encontrado") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Acceso denegado") {
    super(message, 403, "FORBIDDEN");
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "El recurso ya existe") {
    super(message, 409, "CONFLICT");
  }
}
