import express, { Request, Response, NextFunction } from "express";
import { AvailabilityController } from "../controllers/AvailabilityController";

const router = express.Router();
const availabilityController = new AvailabilityController();

/**
 * GET /availability/employee/:id
 * Obtener disponibilidad de un empleado para una fecha y servicio
 * Query: ?service_id=1&date=2025-10-25&timezone=America/Mexico_City
 */
router.get("/employee/:id", (req: Request, res: Response, next: NextFunction) =>
  availabilityController.getEmployeeAvailability(req, res, next)
);

/**
 * GET /availability/provider/:id
 * Obtener disponibilidad de todos los empleados de un proveedor
 * Query: ?service_id=1&date=2025-10-25&timezone=America/Mexico_City
 */
router.get("/provider/:id", (req: Request, res: Response, next: NextFunction) =>
  availabilityController.getProvidersEmployeesAvailability(req, res, next)
);

export default router;
