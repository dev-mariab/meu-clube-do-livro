import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDatabase, runMigrations } from "./config/database.js";
import { authMiddleware } from "./middleware/auth.js";
import authRoutes from "./routes/auth.js";
import booksRoutes from "./routes/books.js";
import goalsRoutes from "./routes/goals.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = (process.env.CORS_ORIGIN || "http://localhost:5173").split(",");

// Middleware
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Test route
app.get("/make-server-93f7c220/test", (req, res) => {
  res.json({
    success: true,
    message: "Server is working!",
    hasAuthHeader: !!req.headers.authorization,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
const apiPrefix = "/make-server-93f7c220";

// Auth routes (public + some protected)
app.use(`${apiPrefix}/auth`, authRoutes);
app.post(`${apiPrefix}/signup`, (req, res) => authRoutes.stack[0].handle(req, res));
app.post(`${apiPrefix}/login`, (req, res) => authRoutes.stack[1].handle(req, res));

// Alternative login endpoint for compatibility
app.post(`${apiPrefix}/login-user`, async (req, res) => {
  // Redirect to login endpoint
  authRoutes.stack[1].handle(req, res);
});

// Books routes (all protected)
app.use(`${apiPrefix}/books`, booksRoutes);
app.get(`${apiPrefix}/stats`, authMiddleware, booksRoutes.stack[2].handle);

// Goals routes (all protected)
app.use(`${apiPrefix}/goals`, goalsRoutes);

// Handle signup endpoint with different method
app.post(`${apiPrefix}/login`, async (req, res) => {
  const { AuthController } = await import("./controllers/AuthController.js");
  AuthController.login(req, res);
});

app.post(`${apiPrefix}/signup`, async (req, res) => {
  const { AuthController } = await import("./controllers/AuthController.js");
  AuthController.signup(req, res);
});

// Initialize database and start server
async function start() {
  try {
    console.log("[Server] Initializing database...");
    await initializeDatabase();

    console.log("[Server] Running migrations...");
    await runMigrations();

    app.listen(PORT, () => {
      console.log(
        `[Server] ✅ Server running at http://localhost:${PORT}`
      );
      console.log(
        `[Server] API prefix: ${apiPrefix}`
      );
      console.log(
        `[Server] CORS enabled for: ${CORS_ORIGIN}`
      );
    });
  } catch (error) {
    console.error("[Server] ❌ Failed to start server:", error);
    process.exit(1);
  }
}

start();

export default app;
