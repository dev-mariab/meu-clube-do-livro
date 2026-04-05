import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDatabase, runMigrations } from "./src/config/database.js";
import { authMiddleware } from "./src/middleware/auth.js";
import { AuthController } from "./src/controllers/AuthController.js";
import { BooksController } from "./src/controllers/BooksController.js";
import { GoalsController } from "./src/controllers/GoalsController.js";
import authRoutes from "./src/routes/auth.js";
import booksRoutes from "./src/routes/books.js";
import goalsRoutes from "./src/routes/goals.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS dinâmico - aceita localhost, *.vercel.app, Railway, e 127.0.0.1
function corsOrigin(origin) {
  if (!origin) return true;

  const allowedPatterns = [
    /^http:\/\/localhost(:\d+)?$/,
    /^http:\/\/127\.0\.0\.1(:\d+)?$/,
    /vercel\.app$/,
    /railway\.app$/,
  ];

  const isAllowed = allowedPatterns.some((pattern) => pattern.test(origin));
  console.log(`[CORS] Origin: ${origin}, Allowed: ${isAllowed}`);
  return isAllowed;
}

// Middleware
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
const apiPrefix = "";

// Auth routes
app.use(`${apiPrefix}/auth`, authRoutes);

// Books routes
app.use(`${apiPrefix}/books`, booksRoutes);

// Goals routes
app.use(`${apiPrefix}/goals`, goalsRoutes);

// Alias routes para compatibilidade com frontend
app.get(`${apiPrefix}/stats`, authMiddleware, (req, res) =>
  BooksController.getStats(req, res)
);

app.get(`${apiPrefix}/goals`, authMiddleware, (req, res) =>
  GoalsController.getGoals(req, res)
);

app.post(`${apiPrefix}/goals`, authMiddleware, (req, res) =>
  GoalsController.setGoals(req, res)
);

// Compatibilidade com frontend
app.post(`${apiPrefix}/login`, (req, res) => AuthController.login(req, res));
app.post(`${apiPrefix}/signup`, (req, res) => AuthController.signup(req, res));

// Initialize database and start server
async function start() {
  try {
    console.log("[Server] Initializing database...");
    await initializeDatabase();

    console.log("[Server] Running migrations...");
    await runMigrations();

    app.listen(PORT, () => {
      console.log(`[Server] ✅ Server running on port ${PORT}`);
      console.log(`[Server] API prefix: ${apiPrefix}`);
      console.log(`[Server] CORS enabled for: localhost, *.vercel.app, *.railway.app`);
    });
  } catch (error) {
    console.error("[Server] ❌ Failed to start server:", error);
    process.exit(1);
  }
}

start().catch((error) => {
  console.error("[Server] ❌ Unhandled error during server startup:", error);
});

export default app;
