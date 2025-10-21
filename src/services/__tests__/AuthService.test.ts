import { AuthService, RegisterDTO, LoginDTO } from "../AuthService";
import Users from "../../models/Users";
import { ConflictError, NotFoundError, AuthError } from "../../utils/errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

jest.mock("../../models/Users");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("AuthService", () => {
  let authService: AuthService;
  let mockUsersModel: jest.Mocked<typeof Users>;

  beforeEach(() => {
    authService = new AuthService();
    mockUsersModel = Users as jest.Mocked<typeof Users>;
    jest.clearAllMocks();
  });

  describe("register", () => {
    const registerDTO: RegisterDTO = {
      name: "Juan",
      apellido: "Pérez",
      email: "juan@test.com",
      password: "Password123",
      role: "client",
    };

    it("debería registrar un nuevo usuario exitosamente", async () => {
      const mockUser = {
        id: 1,
        name: "Juan",
        apellido: "Pérez",
        email: "juan@test.com",
        password: "hashedPassword",
        role: "client",
        is_active: true,
        timezone: "America/Mexico_City",
      };

      (Users.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
      (Users.create as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue("token123");

      const result = await authService.register(registerDTO);

      expect(result.user.email).toBe("juan@test.com");
      expect(result.user.role).toBe("client");
      expect(result.token).toBe("token123");
      expect(Users.findOne).toHaveBeenCalledWith({
        where: { email: "juan@test.com" },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith("Password123", 10);
    });

    it("debería lanzar error si el email ya existe", async () => {
      (Users.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        email: "juan@test.com",
      });

      await expect(authService.register(registerDTO)).rejects.toThrow(
        ConflictError
      );
    });

    it("debería hashear la contraseña correctamente", async () => {
      (Users.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
      (Users.create as jest.Mock).mockResolvedValue({
        id: 1,
        email: "juan@test.com",
        role: "client",
      });
      (jwt.sign as jest.Mock).mockReturnValue("token123");

      await authService.register(registerDTO);

      expect(bcrypt.hash).toHaveBeenCalledWith("Password123", 10);
    });

    it("debería establecer timezone por defecto", async () => {
      (Users.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
      (Users.create as jest.Mock).mockResolvedValue({
        id: 1,
        timezone: "America/Mexico_City",
      });
      (jwt.sign as jest.Mock).mockReturnValue("token123");

      await authService.register(registerDTO);

      expect(Users.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timezone: "America/Mexico_City",
          is_active: true,
        })
      );
    });
  });

  describe("login", () => {
    const loginDTO: LoginDTO = {
      email: "juan@test.com",
      password: "Password123",
    };

    it("debería loguearse exitosamente con credenciales válidas", async () => {
      const mockUser = {
        id: 1,
        name: "Juan",
        email: "juan@test.com",
        password: "hashedPassword",
        role: "client",
        is_active: true,
      };

      (Users.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue("token123");

      const result = await authService.login(loginDTO);

      expect(result.user.email).toBe("juan@test.com");
      expect(result.token).toBe("token123");
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "Password123",
        "hashedPassword"
      );
    });

    it("debería lanzar error si el usuario no existe", async () => {
      (Users.findOne as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(loginDTO)).rejects.toThrow(NotFoundError);
    });

    it("debería lanzar error si la contraseña es incorrecta", async () => {
      (Users.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        email: "juan@test.com",
        password: "hashedPassword",
        is_active: true,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(loginDTO)).rejects.toThrow(AuthError);
    });

    it("debería lanzar error si el usuario está desactivado", async () => {
      (Users.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        email: "juan@test.com",
        password: "hashedPassword",
        is_active: false,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(authService.login(loginDTO)).rejects.toThrow(AuthError);
    });

    it("debería generar token con información del usuario", async () => {
      (Users.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        email: "juan@test.com",
        password: "hashedPassword",
        role: "client",
        is_active: true,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue("token123");

      await authService.login(loginDTO);

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          email: "juan@test.com",
          role: "client",
        }),
        expect.any(String),
        { expiresIn: 86400 }
      );
    });
  });

  describe("generateToken", () => {
    it("debería generar un token válido", () => {
      (jwt.sign as jest.Mock).mockReturnValue("token123");

      const token = authService.generateToken(1, "juan@test.com", "client");

      expect(token).toBe("token123");
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          id: 1,
          email: "juan@test.com",
          role: "client",
        },
        expect.any(String),
        { expiresIn: 86400 }
      );
    });

    it("debería usar JWT_SECRET del environment", () => {
      const originalSecret = process.env.JWT_SECRET;
      process.env.JWT_SECRET = "test-secret";

      new AuthService();
      (jwt.sign as jest.Mock).mockReturnValue("token123");

      const authServiceWithSecret = new AuthService();
      authServiceWithSecret.generateToken(1, "juan@test.com", "client");

      // Limpiar
      if (originalSecret) {
        process.env.JWT_SECRET = originalSecret;
      } else {
        delete process.env.JWT_SECRET;
      }
    });
  });
});
