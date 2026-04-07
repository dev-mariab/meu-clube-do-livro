import { pool } from "../config/database.js";
import bcrypt from "bcryptjs";
export class UserModel {
    static async findByEmail(email) {
        console.log("[UserModel] findByEmail:", email);
        const result = await pool.query("SELECT id, email, name, created_at, updated_at FROM users WHERE email = $1 LIMIT 1", [email]);
        console.log("[UserModel] findByEmail rows:", result.rows.length);
        return result.rows[0] || null;
    }
    static async findByEmailWithPassword(email) {
        console.log("[UserModel] findByEmailWithPassword:", email);
        const result = await pool.query("SELECT id, email, name, password_hash, created_at, updated_at FROM users WHERE email = $1 LIMIT 1", [email]);
        console.log("[UserModel] findByEmailWithPassword rows:", result.rows.length);
        return result.rows[0] || null;
    }
    static async findById(id) {
        const result = await pool.query("SELECT id, email, name, created_at, updated_at FROM users WHERE id = $1 LIMIT 1", [id]);
        return result.rows[0] || null;
    }
    static async create(email, passwordHash, name) {
        const result = await pool.query("INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at, updated_at", [email, passwordHash, name || "Usuário"]);
        return result.rows[0];
    }
    static async hashPassword(password) {
        console.log("[UserModel] hashPassword");
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }
    static async verifyPassword(password, hash) {
        console.log("[UserModel] verifyPassword");
        return bcrypt.compare(password, hash);
    }
    static async updateName(id, name) {
        const result = await pool.query("UPDATE users SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, name, created_at, updated_at", [name, id]);
        return result.rows[0] || null;
    }
}
//# sourceMappingURL=User.js.map