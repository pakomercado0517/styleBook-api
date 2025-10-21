import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { authenticate, authorize } from "../auth.middleware";
import { AuthError } from "../../utils/errors";

jest.mock("jsonwebtoken");

describe("Auth Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
    } as Partial<Request>;

    mockRes = {} as Partial<Response>;
    mockNext = jest.fn() as NextFunction;

    jest.clearAllMocks();
  });

  describe("authenticate", () => {
    it("debería autenticar un token válido", () => {
      const validToken = "validtoken123";
      const decodedUser = {
        id: 1,
        email: "juan@test.com",
        role: "client" as const,
      };

      mockReq.headers = {
        authorization: `Bearer ${validToken}`,
      };

      (jwt.verify as jest.Mock).mockReturnValue(decodedUser);

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.user).toEqual(decodedUser);
      expect(mockNext).toHaveBeenCalled();
      expect(jwt.verify).toHaveBeenCalledWith(
        validToken,
        process.env.JWT_SECRET || "your-secret-key"
      );
    });

    it("debería lanzar error si no hay token", () => {
      mockReq.headers = {};

      expect(() => {
        authenticate(mockReq as Request, mockRes as Response, mockNext);
      }).toThrow(AuthError);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("debería lanzar error si el header no comienza con Bearer", () => {
      mockReq.headers = {
        authorization: "Basic invalidtoken",
      };

      expect(() => {
        authenticate(mockReq as Request, mockRes as Response, mockNext);
      }).toThrow(AuthError);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("debería lanzar error si el token es inválido", () => {
      mockReq.headers = {
        authorization: "Bearer invalidtoken",
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Token inválido");
      });

      expect(() => {
        authenticate(mockReq as Request, mockRes as Response, mockNext);
      }).toThrow(AuthError);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("debería lanzar error si el token ha expirado", () => {
      mockReq.headers = {
        authorization: "Bearer expiredtoken",
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.TokenExpiredError("Token expirado", new Date());
      });

      expect(() => {
        authenticate(mockReq as Request, mockRes as Response, mockNext);
      }).toThrow(AuthError);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("debería extraer correctamente el token del header", () => {
      const validToken = "mytoken123";
      mockReq.headers = {
        authorization: `Bearer ${validToken}`,
      };

      (jwt.verify as jest.Mock).mockReturnValue({
        id: 1,
        email: "test@test.com",
        role: "client",
      });

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith(validToken, expect.any(String));
    });
  });

  describe("authorize", () => {
    it("debería permitir acceso si el rol está autorizado", () => {
      mockReq.user = {
        id: 1,
        email: "juan@test.com",
        role: "provider",
      };

      const middleware = authorize(["provider", "admin"]);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("debería denegar acceso si el rol no está autorizado", () => {
      mockReq.user = {
        id: 1,
        email: "juan@test.com",
        role: "client",
      };

      const middleware = authorize(["provider", "admin"]);

      expect(() => {
        middleware(mockReq as Request, mockRes as Response, mockNext);
      }).toThrow(AuthError);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("debería lanzar error si no hay usuario autenticado", () => {
      mockReq.user = undefined;

      const middleware = authorize(["client"]);

      expect(() => {
        middleware(mockReq as Request, mockRes as Response, mockNext);
      }).toThrow(AuthError);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("debería permitir acceso a múltiples roles", () => {
      mockReq.user = {
        id: 2,
        email: "admin@test.com",
        role: "admin",
      };

      const middleware = authorize(["client", "provider", "admin"]);

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it("debería ser sensible al rol exacto", () => {
      mockReq.user = {
        id: 1,
        email: "juan@test.com",
        role: "client",
      };

      const middleware = authorize(["provider"]);

      expect(() => {
        middleware(mockReq as Request, mockRes as Response, mockNext);
      }).toThrow(AuthError);
    });
  });
});
