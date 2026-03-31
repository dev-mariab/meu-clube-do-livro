import pool from "../config/database.js";

export interface Book {
  id: string;
  user_id: string;
  title: string;
  author?: string;
  isbn?: string;
  category?: string;
  status: "reading" | "completed" | "want-to-read";
  progress: number;
  current_page: number;
  total_pages: number;
  cover_url?: string;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export class BookModel {
  static async findByUserId(userId: string): Promise<Book[]> {
    const result = await pool.query(
      "SELECT * FROM books WHERE user_id = $1 ORDER BY created_at DESC",
      [userId] as any
    );
    return result.rows;
  }

  static async findById(id: string): Promise<Book | null> {
    const result = await pool.query("SELECT * FROM books WHERE id = $1", [id] as any);
    return result.rows[0] || null;
  }

  static async create(bookData: Omit<Book, "id" | "created_at" | "updated_at">): Promise<Book> {
    const {
      user_id,
      title,
      author,
      isbn,
      category,
      status,
      progress,
      current_page,
      total_pages,
      cover_url,
      completed_at,
    } = bookData;

    const result = await pool.query(
      `INSERT INTO books 
       (user_id, title, author, isbn, category, status, progress, current_page, total_pages, cover_url, completed_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING *`,
      [
        user_id,
        title,
        author,
        isbn,
        category,
        status,
        progress,
        current_page,
        total_pages,
        cover_url,
        completed_at,
      ] as any
    );

    return result.rows[0];
  }

  static async update(id: string, updates: Partial<Book>): Promise<Book> {
    const allowedFields = [
      "title",
      "author",
      "isbn",
      "category",
      "status",
      "progress",
      "current_page",
      "total_pages",
      "cover_url",
      "completed_at",
    ];

    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = $${paramCount++}`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      return this.findById(id)!;
    }

    values.push(id); // For WHERE clause
    const query = `UPDATE books SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, values as any);
    return result.rows[0];
  }

  static async delete(id: string): Promise<void> {
    await pool.query("DELETE FROM books WHERE id = $1", [id] as any);
  }

  static async getStatsByUserId(
    userId: string
  ): Promise<{ booksRead: number; currentlyReading: number; pagesThisYear: number }> {
    const currentYear = new Date().getFullYear();

    const result = await pool.query(
      `SELECT 
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as books_read,
        COUNT(CASE WHEN status = 'reading' THEN 1 END) as currently_reading,
        COALESCE(SUM(CASE WHEN status = 'completed' AND EXTRACT(YEAR FROM completed_at) = $2 THEN total_pages ELSE 0 END), 0) as pages_this_year
       FROM books 
       WHERE user_id = $1`,
      [userId, currentYear] as any
    );

    const row = result.rows[0];
    return {
      booksRead: parseInt(row.books_read),
      currentlyReading: parseInt(row.currently_reading),
      pagesThisYear: parseInt(row.pages_this_year),
    };
  }
}
