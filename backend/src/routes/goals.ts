import { Router } from "express";
import { GoalsController } from "../controllers/GoalsController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get("/", GoalsController.getGoals);
router.post("/", GoalsController.setGoals);

export default router;
