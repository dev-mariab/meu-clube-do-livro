import { Router } from "express";
import { AuthController } from "../controllers/AuthController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// Public routes
router.post("/signup", AuthController.signup);
// Ensure the login route is correctly implemented
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await AuthController.login(email, password);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("[AuthController] Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Protected routes
router.get("/me", authMiddleware, AuthController.getMe);
router.put("/me", authMiddleware, AuthController.updateProfile);

export default router;
