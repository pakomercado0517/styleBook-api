import express from "express";
import morgan from "morgan";
import { db } from "./config/db";
import { errorHandler, responseMiddleware } from "./middlewares";
import authRouter from "./router/auth";
import usersRouter from "./router/users";
import providersRouter from "./router/providers";
import servicesRouter from "./router/services";
import appointmentsRouter from "./router/appointments";
import reviewsRouter from "./router/reviews";
import blockedHoursRouter from "./router/blockedHours";

export async function connectDB(): Promise<void> {
  try {
    await db.authenticate();
    await db.sync({ alter: true, force: false });
    console.log("✅ Conexión exitosa a la base de datos");
  } catch (error) {
    console.error("❌ Error al conectar a la base de datos:", error);
    process.exit(1);
  }
}

connectDB();

const app = express();

// Middlewares globales
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de respuesta estándar
app.use(responseMiddleware);

// Rutas
app.get("/", (_req, res) => {
  res.success({ message: "API StyleBook funcionando" }, "Bienvenido a la API");
});

app.get("/health", (_req, res) => {
  res.success({ status: "ok", timestamp: new Date() }, "API en funcionamiento");
});

// Rutas de autenticación
app.use("/auth", authRouter);

// Rutas de usuarios
app.use("/users", usersRouter);

// Rutas de proveedores
app.use("/providers", providersRouter);

// Rutas de servicios
app.use("/services", servicesRouter);

// Rutas de citas
app.use("/appointments", appointmentsRouter);

// Rutas de reseñas
app.use("/reviews", reviewsRouter);

// Rutas de horarios bloqueados
app.use("/blocked-hours", blockedHoursRouter);

// Ruta no encontrada
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
    path: _req.path,
    timestamp: new Date().toISOString(),
  });
});

// Middleware de error (DEBE SER EL ÚLTIMO)
app.use(errorHandler);

export default app;
