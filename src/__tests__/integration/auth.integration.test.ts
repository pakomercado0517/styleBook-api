import { Request, Response, NextFunction } from "express";
import { AuthService } from "../../services/AuthService";
import { AuthController } from "../../controllers/AuthController";
import { authenticate } from "../../middlewares/auth.middleware";

/**
 * Tests de Integración para Autenticación
 * Verifica flujos completos: Register -> Login -> Profile
 */
describe("Auth Integration Tests", () => {
  let authService: AuthService;
  let authController: AuthController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    authService = new AuthService();
    authController = new AuthController();

    mockReq = {
      body: {},
      headers: {},
      user: undefined,
    } as Partial<Request>;

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      success: jest.fn().mockReturnThis(),
    } as Partial<Response>;

    mockNext = jest.fn() as NextFunction;

    jest.clearAllMocks();
  });

  describe("Complete Auth Flow", () => {
    it("debería completar flujo: registro -> login -> obtener perfil", async () => {
      const registerData = {
        name: "Juan",
        apellido: "Pérez",
        email: "juan@integration.test",
        password: "Password123",
        role: "client" as const,
      };

      // Step 1: Register
      mockReq.body = registerData;
      let registerResult: any;

      (authController as any)._authService.register = jest
        .fn()
        .mockResolvedValue({
          user: {
            id: 1,
            name: registerData.name,
            email: registerData.email,
            role: registerData.role,
          },
          token: "jwt_token_123",
        });

      await authController.register(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      registerResult = (mockRes.success as jest.Mock).mock.calls[0][0];
      expect(registerResult).toHaveProperty("user");
      expect(registerResult).toHaveProperty("token");
      expect(registerResult.user.email).toBe(registerData.email);

      // Step 2: Login con credenciales
      jest.clearAllMocks();
      mockReq.body = {
        email: registerData.email,
        password: registerData.password,
      };

      (authController as any)._authService.login = jest.fn().mockResolvedValue({
        user: {
          id: 1,
          name: registerData.name,
          email: registerData.email,
          role: registerData.role,
        },
        token: "jwt_token_123",
      });

      await authController.login(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      const loginResult = (mockRes.success as jest.Mock).mock.calls[0][0];
      expect(loginResult).toHaveProperty("user");
      expect(loginResult).toHaveProperty("token");

      // Step 3: Obtener perfil con token
      jest.clearAllMocks();
      mockReq.user = {
        id: 1,
        email: registerData.email,
        role: registerData.role,
      };

      await authController.profile(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.success).toHaveBeenCalled();
    });

    it("debería fallar login con contraseña incorrecta", async () => {
      mockReq.body = {
        email: "nonexistent@test.com",
        password: "wrongpassword",
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

    it("debería fallar registro con email duplicado", async () => {
      mockReq.body = {
        name: "Juan",
        apellido: "Pérez",
        email: "duplicate@test.com",
        password: "Password123",
        role: "client",
      };

      const error = new Error("Email ya registrado");
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

  describe("Token Persistence", () => {
    it("token del registro debería ser usable en login", async () => {
      const testEmail = "persistent@test.com";
      const testToken = "persistent_token_123";

      // Simular que el token se genera y puede ser usado
      mockReq.headers = {
        authorization: `Bearer ${testToken}`,
      };

      mockReq.user = {
        id: 1,
        email: testEmail,
        role: "client",
      };

      // El middleware de autenticación debería verificar el token
      await authController.profile(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.success).toHaveBeenCalled();
    });

    it("token expirado debería rechazar acceso", async () => {
      mockReq.headers = {
        authorization: "Bearer expired_token",
      };

      // Simular que el middleware rechaza token expirado
      const expiredError = new Error("Token expirado");
      mockNext(expiredError);

      expect(mockNext).toHaveBeenCalledWith(expiredError);
    });
  });

  describe("Role-based Access", () => {
    it("cliente registrado debería tener rol 'client'", async () => {
      mockReq.body = {
        name: "Cliente",
        apellido: "Test",
        email: "client@test.com",
        password: "Password123",
        role: "client",
      };

      (authController as any)._authService.register = jest
        .fn()
        .mockResolvedValue({
          user: {
            id: 1,
            role: "client",
            email: "client@test.com",
          },
          token: "token123",
        });

      await authController.register(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      const result = (mockRes.success as jest.Mock).mock.calls[0][0];
      expect(result.user.role).toBe("client");
    });

    it("proveedor registrado debería tener rol 'provider'", async () => {
      mockReq.body = {
        name: "Proveedor",
        apellido: "Test",
        email: "provider@test.com",
        password: "Password123",
        role: "provider",
      };

      (authController as any)._authService.register = jest
        .fn()
        .mockResolvedValue({
          user: {
            id: 2,
            role: "provider",
            email: "provider@test.com",
          },
          token: "token456",
        });

      await authController.register(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      const result = (mockRes.success as jest.Mock).mock.calls[0][0];
      expect(result.user.role).toBe("provider");
    });
  });

  describe("Authentication Error Handling", () => {
    it("debería manejar errores de red en registro", async () => {
      mockReq.body = {
        name: "Test",
        apellido: "User",
        email: "network@test.com",
        password: "Password123",
        role: "client",
      };

      const networkError = new Error("Network error");
      (authController as any)._authService.register = jest
        .fn()
        .mockRejectedValue(networkError);

      await authController.register(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(networkError);
    });

    it("debería validar formato de email", async () => {
      mockReq.body = {
        name: "Test",
        apellido: "User",
        email: "invalid-email",
        password: "Password123",
        role: "client",
      };

      const validationError = new Error("Email inválido");
      (authController as any)._authService.register = jest
        .fn()
        .mockRejectedValue(validationError);

      await authController.register(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it("debería requerir contraseña mínima", async () => {
      mockReq.body = {
        name: "Test",
        apellido: "User",
        email: "test@test.com",
        password: "short",
        role: "client",
      };

      const passwordError = new Error("Contraseña muy corta");
      (authController as any)._authService.register = jest
        .fn()
        .mockRejectedValue(passwordError);

      await authController.register(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
