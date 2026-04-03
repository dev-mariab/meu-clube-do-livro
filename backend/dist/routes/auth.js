import { Router } from "express";
import { AuthController } from "../controllers/AuthController.js";
import { authMiddleware } from "../middleware/auth.js";
const router = Router();
// Public routes
router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);
// Protected routes
router.get("/me", authMiddleware, AuthController.getMe);
router.put("/me", authMiddleware, AuthController.updateProfile);
export default router;
//# sourceMappingURL=auth.js.map