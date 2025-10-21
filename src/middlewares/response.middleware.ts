import { Request, Response, NextFunction } from "express";

// Extender Response para agregar métodos personalizados
declare global {
  namespace Express {
    interface Response {
      success<T>(data: T, message?: string, statusCode?: number): Response;
      error(message: string, statusCode?: number): Response;
    }
  }
}

export const responseMiddleware = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Respuesta exitosa
  res.success = function <T>(
    data: T,
    message: string = "Éxito",
    statusCode: number = 200
  ): Response {
    return this.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  };

  // Respuesta de error (para casos especiales)
  res.error = function (
    message: string = "Error",
    statusCode: number = 400
  ): Response {
    return this.status(statusCode).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
    });
  };

  next();
};
