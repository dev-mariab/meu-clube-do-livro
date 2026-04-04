import { pool } from "../config/database.js";
export class BookModel {
    static async findByUserId(userId) {
        const result = await pool.query("SELECT * FROM books WHERE user_id = $1 ORDER BY created_at DESC", [userId]);
        return result.rows;
    }
    static async findById(id) {
        const result = await pool.query("SELECT * FROM books WHERE id = $1", [id]);
        return this.findById(id) ?? (() => { throw new Error("Book not found"); })();
    }
    static async create(bookData) {
        const { user_id, title, author, isbn, category, status, progress, current_page, total_pages, cover_url, completed_at, rating, review, } = bookData;
        const result = await pool.query(`INSERT INTO books 
       (user_id, title, author, isbn, category, status, progress, current_page, total_pages, cover_url, completed_at, rating, review) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
       RETURNING *`, [
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
            rating,
            review,
        ]);
        return result.rows[0];
    }
    static async update(id, updates) {
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
            "rating",
            "review",
        ];
        const fields = [];
        const values = [];
        let paramCount = 1;
        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                fields.push(`${key} = $${paramCount++}`);
                values.push(value);
            }
        }
        if (fields.length === 0) {
            return this.findById(id);
        }
        values.push(id); // For WHERE clause
        const query = `UPDATE books SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`;
        const result = await pool.query(query, values);
        return result.rows[0];
    }
    static async delete(id) {
        await pool.query("DELETE FROM books WHERE id = $1", [id]);
    }
    static async getStatsByUserId(userId) {
        const currentYear = new Date().getFullYear();
        const result = await pool.query(`SELECT 
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as books_read,
        COUNT(CASE WHEN status = 'reading' THEN 1 END) as currently_reading,
        COALESCE(
          SUM(CASE WHEN status = 'completed' AND EXTRACT(YEAR FROM completed_at) = $2 THEN total_pages ELSE 0 END) +
          SUM(CASE WHEN status = 'reading' THEN current_page ELSE 0 END),
          0
        ) as pages_this_year
       FROM books 
       WHERE user_id = $1`, [userId, currentYear]);
        const row = result.rows[0];
        return {
            booksRead: parseInt(row.books_read),
            currentlyReading: parseInt(row.currently_reading),
            pagesThisYear: parseInt(row.pages_this_year),
        };
    }
}
//# sourceMappingURL=Book.js.map