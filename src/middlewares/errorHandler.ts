import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";

// Middleware para manejar TODOS los errores
export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Si es nuestro AppError, usar statusCode
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Error genérico (inesperado)
  console.error("Error inesperado:", err);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
    code: "INTERNAL_ERROR",
    timestamp: new Date().toISOString(),
  });
};
