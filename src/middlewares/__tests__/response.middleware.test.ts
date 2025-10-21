import { Request, Response, NextFunction } from "express";
import { responseMiddleware } from "../response.middleware";

describe("Response Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: any;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {} as Partial<Request>;

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;

    mockNext = jest.fn() as NextFunction;

    responseMiddleware(mockReq as Request, mockRes as Response, mockNext);
  });

  describe("res.success method", () => {
    it("debería responder con datos y mensaje", () => {
      const data = { id: 1, name: "Test" };
      const message = "Success";

      mockRes.success(data, message);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message,
        data,
        timestamp: expect.any(String),
      });
    });

    it("debería usar status code 201 si se proporciona", () => {
      const data = { id: 1 };
      const message = "Created";

      mockRes.success(data, message, 201);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message,
          data,
        })
      );
    });

    it("debería usar status code 200 por defecto", () => {
      const data = { id: 1 };

      mockRes.success(data, "Success");

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("debería usar mensaje por defecto si no se proporciona", () => {
      const data = { id: 1 };

      mockRes.success(data);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Éxito",
        })
      );
    });

    it("debería incluir timestamp en la respuesta", () => {
      mockRes.success({ id: 1 }, "Test");

      const call = mockRes.json.mock.calls[0][0];
      expect(call.timestamp).toBeDefined();
      expect(typeof call.timestamp).toBe("string");
    });

    it("debería retornar la instancia de response (para encadenamiento)", () => {
      const result = mockRes.success({ id: 1 }, "Test");

      expect(result).toBe(mockRes);
    });

    it("debería manejar datos null", () => {
      mockRes.success(null, "Success");

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: null,
          success: true,
        })
      );
    });

    it("debería manejar arrays como datos", () => {
      const data = [{ id: 1 }, { id: 2 }];

      mockRes.success(data, "List");

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data,
        })
      );
    });

    it("debería siempre retornar success: true", () => {
      mockRes.success({ test: "data" }, "Message");

      const call = mockRes.json.mock.calls[0][0];
      expect(call.success).toBe(true);
    });

    it("debería aceptar status codes personalizados", () => {
      mockRes.success({ id: 1 }, "Accepted", 202);

      expect(mockRes.status).toHaveBeenCalledWith(202);
    });
  });

  describe("res.error method", () => {
    it("debería responder con mensaje de error", () => {
      const message = "Error occurred";

      mockRes.error(message);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message,
        timestamp: expect.any(String),
      });
    });

    it("debería usar status code 400 por defecto", () => {
      mockRes.error("Error");

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("debería usar status code personalizado", () => {
      mockRes.error("Not found", 404);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("debería usar mensaje por defecto si no se proporciona", () => {
      mockRes.error();

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Error",
        })
      );
    });

    it("debería incluir timestamp", () => {
      mockRes.error("Error");

      const call = mockRes.json.mock.calls[0][0];
      expect(call.timestamp).toBeDefined();
    });

    it("debería retornar la instancia de response", () => {
      const result = mockRes.error("Error");

      expect(result).toBe(mockRes);
    });

    it("debería siempre retornar success: false", () => {
      mockRes.error("Something went wrong");

      const call = mockRes.json.mock.calls[0][0];
      expect(call.success).toBe(false);
    });

    it("debería aceptar status codes de error personalizados", () => {
      mockRes.error("Unauthorized", 401);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });

  describe("middleware initialization", () => {
    it("debería llamar a next()", () => {
      const mockNextFn = jest.fn() as NextFunction;

      responseMiddleware(mockReq as Request, mockRes, mockNextFn);

      expect(mockNextFn).toHaveBeenCalled();
    });

    it("debería agregar métodos success y error a la respuesta", () => {
      expect(typeof mockRes.success).toBe("function");
      expect(typeof mockRes.error).toBe("function");
    });
  });

  describe("Response structure consistency", () => {
    it("debería tener estructura consistente en success", () => {
      mockRes.success({ data: "test" }, "Message");

      const call = mockRes.json.mock.calls[0][0];
      expect(call).toHaveProperty("success");
      expect(call).toHaveProperty("message");
      expect(call).toHaveProperty("data");
      expect(call).toHaveProperty("timestamp");
    });

    it("debería tener estructura consistente en error", () => {
      mockRes.error("Error");

      const call = mockRes.json.mock.calls[0][0];
      expect(call).toHaveProperty("success");
      expect(call).toHaveProperty("message");
      expect(call).toHaveProperty("timestamp");
    });
  });
});
