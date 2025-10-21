import { Request, Response, NextFunction } from "express";
import { errorHandler } from "../errorHandler";
import {
  AppError,
  AuthError,
  NotFoundError,
  ValidationError,
} from "../../utils/errors";

describe("Error Handler Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {} as Partial<Request>;
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as Partial<Response>;
    mockNext = jest.fn() as NextFunction;

    jest.clearAllMocks();
  });

  describe("AppError handling", () => {
    it("debería manejar AppError correctamente", () => {
      const error = new AppError("Recurso no encontrado", 404);

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Recurso no encontrado",
        })
      );
    });

    it("debería manejar AuthError", () => {
      const error = new AuthError("Token inválido");

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalled();
    });

    it("debería manejar NotFoundError", () => {
      const error = new NotFoundError("Usuario no encontrado");

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalled();
    });

    it("debería manejar ValidationError", () => {
      const error = new ValidationError("Datos inválidos");

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalled();
    });

    it("debería incluir el código de error en la respuesta", () => {
      const error = new AppError("Error de negocio", 422);

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: expect.any(String),
        })
      );
    });

    it("debería incluir timestamp en la respuesta", () => {
      const error = new AppError("Error", 500);

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(String),
        })
      );
    });
  });

  describe("Generic Error handling", () => {
    it("debería manejar errores genéricos", () => {
      const error = new Error("Algo salió mal");

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Error interno del servidor",
          code: "INTERNAL_ERROR",
        })
      );
    });

    it("debería devolver 500 para errores inesperados", () => {
      const error = new TypeError("Cannot read property 'x' of undefined");

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    it("debería incluir timestamp en errores genéricos", () => {
      const error = new Error("Error genérico");

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(String),
        })
      );
    });
  });

  describe("Response structure", () => {
    it("debería tener estructura consistente", () => {
      const error = new AppError("Test error", 400);

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.any(String),
          code: expect.any(String),
          timestamp: expect.any(String),
        })
      );
    });

    it("debería siempre retornar success: false", () => {
      const errors = [
        new AppError("App error", 400),
        new Error("Generic error"),
      ];

      errors.forEach((error) => {
        jest.clearAllMocks();

        errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

        const call = (mockRes.json as jest.Mock).mock.calls[0][0];
        expect(call.success).toBe(false);
      });
    });
  });
});
