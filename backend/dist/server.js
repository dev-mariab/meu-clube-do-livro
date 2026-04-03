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
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
// CORS dinâmico - aceita localhost, *.vercel.app, Railway, e 127.0.0.1
function corsOrigin(origin) {
    if (!origin)
        return true; // Mobile apps e desktop, requests sem origin header
    const allowedPatterns = [
        /^http:\/\/localhost(:\d+)?$/, // localhost
        /^http:\/\/127\.0\.0\.1(:\d+)?$/, // 127.0.0.1
        /vercel\.app$/, // *.vercel.app
        /railway\.app$/, // *.railway.app (inclui .up.railway.app)
    ];
    const isAllowed = allowedPatterns.some((pattern) => pattern.test(origin));
    console.log(`[CORS] Origin: ${origin}, Allowed: ${isAllowed}`);
    return isAllowed;
}
// Middleware
app.use(cors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
}));
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
// Initialize database and start server
async function start() {
    try {
        console.log("[Server] Initializing database...");
        await initializeDatabase();
        console.log("[Server] Running migrations...");
        await runMigrations();
        app.listen(PORT, () => {
            console.log(`[Server] ✅ Server running at http://localhost:${PORT}`);
            console.log(`[Server] API prefix: ${apiPrefix}`);
            console.log(`[Server] CORS enabled for: localhost, *.vercel.app`);
        });
    }
    catch (error) {
        console.error("[Server] ❌ Failed to start server:", error);
        process.exit(1);
    }
}
start();
export default app;
//# sourceMappingURL=server.js.map