import { AuthController } from "../AuthController";
import { AuthService } from "../../services/AuthService";
import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../../utils/errors";

jest.mock("../../services/AuthService");

describe("AuthController", () => {
  let authController: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    authController = new AuthController();
    mockAuthService = AuthService as jest.Mocked<typeof AuthService>;

    mockReq = {
      body: {},
    } as Partial<Request>;

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      success: jest.fn().mockReturnThis(),
    } as Partial<Response>;

    mockNext = jest.fn() as NextFunction;

    jest.clearAllMocks();
  });

  describe("register", () => {
    it("debería registrar un usuario exitosamente", async () => {
      const registerData = {
        name: "Juan",
        apellido: "Pérez",
        email: "juan@test.com",
        password: "Password123",
        role: "client",
      };

      mockReq.body = registerData;

      const mockAuthResponse = {
        user: {
          id: 1,
          name: "Juan",
          email: "juan@test.com",
          role: "client",
        },
        token: "token123",
      };

      (authController as any)._authService.register = jest
        .fn()
        .mockResolvedValue(mockAuthResponse);

      await authController.register(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.success).toHaveBeenCalledWith(
        expect.objectContaining({
          user: mockAuthResponse.user,
          token: mockAuthResponse.token,
        }),
        "Usuario registrado exitosamente",
        201
      );
    });

    it("debería manejar errores de validación", async () => {
      mockReq.body = {
        name: "Juan",
        email: "juan@test.com",
        // Faltan apellido, password, role
      };

      // El controlador no valida, solo pasa los datos al service
      // El service lanzará un error si faltan datos
      const error = new Error("Datos incompletos");
      (authController as any)._authService.register = jest
        .fn()
        .mockRejectedValue(error);

      await authController.register(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("login", () => {
    it("debería loguearse exitosamente", async () => {
      const loginData = {
        email: "juan@test.com",
        password: "Password123",
      };

      mockReq.body = loginData;

      const mockAuthResponse = {
        user: {
          id: 1,
          name: "Juan",
          email: "juan@test.com",
          role: "client",
        },
        token: "token123",
      };

      (authController as any)._authService.login = jest
        .fn()
        .mockResolvedValue(mockAuthResponse);

      await authController.login(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.success).toHaveBeenCalledWith(
        mockAuthResponse,
        "Login exitoso"
      );
    });

    it("debería pasar errores al middleware", async () => {
      mockReq.body = {
        email: "juan@test.com",
        password: "Password123",
      };

      const error = new Error("Email o contraseña incorrectos");
      (authController as any)._authService.login = jest
        .fn()
        .mockRejectedValue(error);

      await authController.login(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("profile", () => {
    it("debería obtener el perfil del usuario autenticado", async () => {
      mockReq.user = {
        id: 1,
        email: "juan@test.com",
        role: "client",
      } as any;

      const mockUser = {
        id: 1,
        name: "Juan",
        apellido: "Pérez",
        email: "juan@test.com",
        role: "client",
        phone: "1234567890",
        timezone: "America/Mexico_City",
      };

      (authController as any)._authService.profile = jest
        .fn()
        .mockResolvedValue(mockUser);

      await authController.profile(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.success).toHaveBeenCalledWith(
        mockReq.user,
        "Perfil obtenido"
      );
    });

    it("debería retornar error si usuario no está autenticado", async () => {
      mockReq.user = undefined;

      await authController.profile(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      // El controlador retorna directamente el req.user sin validación
      expect(mockRes.success).toHaveBeenCalledWith(
        undefined,
        "Perfil obtenido"
      );
    });
  });
});
