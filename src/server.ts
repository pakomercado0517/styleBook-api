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
import availabilityRouter from "./router/availability";
import favoritesRouter from "./router/favorites";
import emailTestRouter from "./router/emailTestRouter";
import cors from "cors";

export async function connectDB(): Promise<void> {
  try {
    await db.authenticate();
    await db.sync({ alter: true, force: true });
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
app.use(
  cors({
    origin: `${process.env.FRONTEND_URL}`,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware de respuesta estándar
app.use(responseMiddleware);

// Rutas
app.get("/", (_req, res) => {
  res.success({ message: "API StyleBook funcionando" }, "Bienvenido a la API");
});

app.get("/health", (_req, res) => {
  res.success({ status: "ok", timestamp: new Date() }, "API en funcionamiento");
});

// Rutas de la API con prefijo /api
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/providers", providersRouter);
app.use("/api/services", servicesRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/blocked-hours", blockedHoursRouter);
app.use("/api/availability", availabilityRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api/emails", emailTestRouter); // Email testing routes

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
