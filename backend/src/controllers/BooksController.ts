import { Request, Response } from "express";
import { BookModel, Book } from "../models/Book.js";

export class BooksController {
  static async getBooks(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const books = await BookModel.findByUserId(req.user.userId);
      res.json({ books });
    } catch (error) {
      console.error("[BooksController] Get books error:", error);
      res.status(500).json({ error: "Failed to fetch books" });
    }
  }

  static async getBook(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const book = await BookModel.findById(req.params.id);
      if (!book) {
        res.status(404).json({ error: "Book not found" });
        return;
      }

      if (book.user_id !== req.user.userId) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      res.json({ book });
    } catch (error) {
      console.error("[BooksController] Get book error:", error);
      res.status(500).json({ error: "Failed to fetch book" });
    }
  }

  static async createBook(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const {
        title,
        author,
        isbn,
        category,
        status,
        progress,
        current_page,
        total_pages,
        cover_url,
      } = req.body;

      if (!title) {
        res.status(400).json({ error: "Title is required" });
        return;
      }

      const bookData: Omit<Book, "id" | "created_at" | "updated_at"> = {
        user_id: req.user.userId,
        title,
        author,
        isbn,
        category,
        status: status || "reading",
        progress: progress || 0,
        current_page: current_page || 0,
        total_pages: total_pages || 0,
        cover_url,
        completed_at:
          status === "completed" ? new Date() : undefined,
      };

      const book = await BookModel.create(bookData);
      res.status(201).json(book);
    } catch (error) {
      console.error("[BooksController] Create book error:", error);
      res.status(500).json({ error: "Failed to create book" });
    }
  }

  static async updateBook(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const book = await BookModel.findById(req.params.id);
      if (!book) {
        res.status(404).json({ error: "Book not found" });
        return;
      }

      if (book.user_id !== req.user.userId) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      const updates = req.body;
      if (updates.status === "completed" && !updates.completed_at) {
        updates.completed_at = new Date();
      }

      const updated = await BookModel.update(req.params.id, updates);
      res.json(updated);
    } catch (error) {
      console.error("[BooksController] Update book error:", error);
      res.status(500).json({ error: "Failed to update book" });
    }
  }

  static async deleteBook(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const book = await BookModel.findById(req.params.id);
      if (!book) {
        res.status(404).json({ error: "Book not found" });
        return;
      }

      if (book.user_id !== req.user.userId) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      await BookModel.delete(req.params.id);
      res.json({ message: "Book deleted" });
    } catch (error) {
      console.error("[BooksController] Delete book error:", error);
      res.status(500).json({ error: "Failed to delete book" });
    }
  }

  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const stats = await BookModel.getStatsByUserId(req.user.userId);
      res.json(stats);
    } catch (error) {
      console.error("[BooksController] Get stats error:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  }
}
