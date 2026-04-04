import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
// CORS simples - aceita tudo por enquanto
app.use(cors());
app.use(express.json({ limit: "50mb" }));
// Health check apenas
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// Simple test
app.get("/test", (req, res) => {
    res.json({ message: "Server works!" });
});
// Start server WITHOUT database initialization
app.listen(PORT, () => {
    console.log(`[Server] ✅ Minimal server running at http://localhost:${PORT}`);
});
//# sourceMappingURL=server.minimal.js.map