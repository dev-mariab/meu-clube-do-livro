import { pool } from "../config/database.js";
import bcrypt from "bcryptjs";
export class UserModel {
    static async findByEmail(email) {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [
            email,
        ]);
        return result.rows[0] || null;
    }
    static async findById(id) {
        const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
        return result.rows[0] || null;
    }
    static async create(email, passwordHash, name) {
        const result = await pool.query("INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at, updated_at", [email, passwordHash, name || "Usuário"]);
        return result.rows[0];
    }
    static async getPasswordHash(email) {
        const result = await pool.query("SELECT password_hash FROM users WHERE email = $1", [email]);
        return result.rows[0]?.password_hash || null;
    }
    static async hashPassword(password) {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }
    static async verifyPassword(password, hash) {
        return bcrypt.compare(password, hash);
    }
    static async updateName(id, name) {
        const result = await pool.query("UPDATE users SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, name, created_at, updated_at", [name, id]);
        return result.rows[0] || null;
    }
}
//# sourceMappingURL=User.js.map