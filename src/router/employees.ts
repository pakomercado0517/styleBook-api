import express, { Request, Response, NextFunction } from "express";
import { EmployeeController } from "../controllers/EmployeeController";
import { authenticate } from "../middlewares";
import { employeeValidators, handleValidationErrors } from "../validators";

const router = express.Router();
const employeeController = new EmployeeController();

/**
 * GET /employees
 * Obtener todos los empleados (paginado)
 * Query: ?limit=20&offset=0&provider_id=7
 */
router.get("/", (req: Request, res: Response, next: NextFunction) =>
  employeeController.getAllEmployees(req, res, next)
);

/**
 * GET /employees/:id
 * Obtener empleado por ID
 */
router.get(
  "/:id",
  employeeValidators.getById,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    employeeController.getEmployeeById(req, res, next)
);

/**
 * GET /employees/provider/:provider_id
 * Obtener empleados de un proveedor
 * Query: ?limit=20&offset=0
 */
router.get(
  "/provider/:provider_id",
  employeeValidators.getByProvider,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    employeeController.getEmployeesByProvider(req, res, next)
);

/**
 * POST /employees
 * Crear empleado
 * Headers: Authorization: Bearer {token}
 * Body: { provider_id, name, email, phone?, specialty?, photo_url? }
 */
router.post(
  "/",
  authenticate,
  employeeValidators.create,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    employeeController.createEmployee(req, res, next)
);

/**
 * PUT /employees/:id
 * Actualizar empleado
 * Headers: Authorization: Bearer {token}
 * Body: { name?, email?, phone?, specialty?, photo_url? }
 */
router.put(
  "/:id",
  authenticate,
  employeeValidators.update,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    employeeController.updateEmployee(req, res, next)
);

/**
 * DELETE /employees/:id
 * Eliminar empleado
 * Headers: Authorization: Bearer {token}
 */
router.delete(
  "/:id",
  authenticate,
  employeeValidators.delete,
  handleValidationErrors,
  (req: Request, res: Response, next: NextFunction) =>
    employeeController.deleteEmployee(req, res, next)
);

export default router;

