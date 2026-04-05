import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDatabase, runMigrations } from "./config/database.js";
import { authMiddleware } from "./middleware/auth.js";
import { AuthController } from "./controllers/AuthController.js";
import { BooksController } from "./controllers/BooksController.js";
import { GoalsController } from "./controllers/GoalsController.js";
import authRoutes from "./routes/auth.js";
import booksRoutes from "./routes/books.js";
import goalsRoutes from "./routes/goals.js";
import morgan from "morgan";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const apiPrefix = "/api";

console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
console.log("PORT:", process.env.PORT);

function corsOrigin(origin: string | undefined): boolean {
  if (!origin) return true;

  const allowedPatterns = [
    /^http:\/\/localhost(:\d+)?$/,
    /^http:\/\/127\.0\.0\.1(:\d+)?$/,
    /^https:\/\/.*\.vercel\.app$/,
    /^https:\/\/.*\.railway\.app$/,
    /^https:\/\/.*\.up\.railway\.app$/,
    /^https:\/\/meu-clube-do-livro\.vercel\.app$/,
  ];

  const isAllowed = allowedPatterns.some((pattern) => pattern.test(origin));
  console.log(`[CORS] Origin: ${origin}, Allowed: ${isAllowed}`);

  return isAllowed;
}

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
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/books`, booksRoutes);
app.use(`${apiPrefix}/goals`, goalsRoutes);

// Aliases
app.get(`${apiPrefix}/stats`, authMiddleware, (req, res) =>
  BooksController.getStats(req, res)
);

app.get(`${apiPrefix}/goals`, authMiddleware, (req, res) =>
  GoalsController.getGoals(req, res)
);

app.post(`${apiPrefix}/goals`, authMiddleware, (req, res) =>
  GoalsController.setGoals(req, res)
);

// Auth compatibility routes
app.post(`${apiPrefix}/login`, (req, res) => AuthController.login(req, res));
app.post(`${apiPrefix}/signup`, (req, res) => AuthController.signup(req, res));

// User profile routes
app.get(`${apiPrefix}/me`, authMiddleware, (req, res) =>
  AuthController.getMe(req, res)
);

app.put(`${apiPrefix}/me`, authMiddleware, (req, res) =>
  AuthController.updateProfile(req, res)
);

async function start() {
  try {
    console.log("[Server] Initializing database...");
    await initializeDatabase();
    console.log("[Server] Database initialized successfully");

    console.log("[Server] Running migrations...");
    await runMigrations();
    console.log("[Server] Migrations completed successfully");

    app.listen(PORT, () => {
      console.log(`[Server] ✅ Server running on port ${PORT}`);
      console.log(`[Server] Health available at /health`);
    });
  } catch (error) {
    console.error("[Server] ❌ Failed to start server:", error);
    if (error instanceof Error) {
      console.error("[Server] Stack trace:", error.stack);
    }
    process.exit(1);
  }
}

start().catch((error) => {
  console.error("[Server] ❌ Unhandled startup error:", error);
  if (error instanceof Error) {
    console.error("[Server] Stack trace:", error.stack);
  }
});

export default app;
