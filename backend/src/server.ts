import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { initializeDatabase, runMigrations } from "./config/database.js";
import { authMiddleware } from "./middleware/auth.js";
import { AuthController } from "./controllers/AuthController.js";
import { BooksController } from "./controllers/BooksController.js";
import { GoalsController } from "./controllers/GoalsController.js";
import authRoutes from "./routes/auth.js";
import booksRoutes from "./routes/books.js";
import goalsRoutes from "./routes/goals.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import morgan from 'morgan';

// Substitui __dirname para compatibilidade com ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carrega o arquivo .env explicitamente
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Log para verificar o caminho do arquivo .env
console.log("Caminho do arquivo .env:", path.resolve(__dirname, "../.env"));

// Log para verificar se as variáveis de ambiente estão sendo carregadas
console.log("Variáveis de ambiente carregadas:", process.env);

// Log adicional para verificar DATABASE_URL
console.log("DATABASE_URL:", process.env.DATABASE_URL);

const app = express();
const PORT = process.env.PORT || 3000;

// CORS dinâmico - aceita localhost, *.vercel.app, Railway, e 127.0.0.1
function corsOrigin(origin: string | undefined): boolean {
  if (!origin) return true; // Mobile apps e desktop, requests sem origin header

  const allowedPatterns = [
    /^http:\/\/localhost(:\d+)?$/,          // localhost
    /^http:\/\/127\.0\.0\.1(:\d+)?$/,       // 127.0.0.1
    /vercel\.app$/,                          // *.vercel.app
    /railway\.app$/,                         // *.railway.app (inclui .up.railway.app)
    /^https:\/\/meu-clube-do-livro\.vercel\.app$/, // Domínio completo do frontend
  ];

  const isAllowed = allowedPatterns.some((pattern) => pattern.test(origin));
  console.log(`[CORS] Origin: ${origin}, Allowed: ${isAllowed}`);

  if (!isAllowed) {
    console.warn(`[CORS] Requisição bloqueada para a origem: ${origin}`);
  }

  return isAllowed;
}

// Middleware
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(morgan('combined'));

// Middleware para logar todas as requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
const apiPrefix = "";

// Auth routes (public + some protected)
app.use(`${apiPrefix}/auth`, authRoutes);

// Books routes (all protected)
app.use(`${apiPrefix}/books`, booksRoutes);

// Goals routes (all protected)
app.use(`${apiPrefix}/goals`, goalsRoutes);

// Alias routes para compatibilidade com frontend
// Frontend chama /stats e /goals diretamente, não via /books/stats
app.get(`${apiPrefix}/stats`, authMiddleware, (req, res) => BooksController.getStats(req, res));
app.get(`${apiPrefix}/goals`, authMiddleware, (req, res) => GoalsController.getGoals(req, res));
app.post(`${apiPrefix}/goals`, authMiddleware, (req, res) => GoalsController.setGoals(req, res));

// Handle login/signup endpoints with different routes for compatibility
app.post(`${apiPrefix}/login`, (req, res) => AuthController.login(req, res));
app.post(`${apiPrefix}/signup`, (req, res) => AuthController.signup(req, res));

// Adicionar logs detalhados para depuração
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
        `[Server] CORS enabled for: localhost, *.vercel.app`
      );
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
  console.error("[Server] ❌ Unhandled error during server startup:", error);
  if (error instanceof Error) {
    console.error("[Server] Stack trace:", error.stack);
  }
});

export default app;
