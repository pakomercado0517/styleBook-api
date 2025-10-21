import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthError } from "../utils/errors";

// Extender Request para agregar user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: "client" | "provider" | "admin";
      };
    }
  }
}

// Middleware de autenticación
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AuthError("Token no proporcionado");
    }

    const token = authHeader.substring(7); // Quitar "Bearer "

    // Verificar token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as {
      id: number;
      email: string;
      role: "client" | "provider" | "admin";
    };

    // Agregar usuario a request
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthError("Token expirado");
    }
    throw new AuthError("Token inválido");
  }
};

// Middleware para validar rol
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AuthError("No autenticado");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AuthError("No tienes permiso para acceder a este recurso");
    }

    next();
  };
};
