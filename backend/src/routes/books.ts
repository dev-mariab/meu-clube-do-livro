import { Router } from "express";
import { BooksController } from "../controllers/BooksController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get("/", BooksController.getBooks);
router.get("/stats", BooksController.getStats);
router.post("/", BooksController.createBook);
router.get("/:id", BooksController.getBook);
router.put("/:id", BooksController.updateBook);
router.delete("/:id", BooksController.deleteBook);

export default router;
