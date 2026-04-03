import { pool } from "../config/database.js";
import bcrypt from "bcryptjs";

export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: Date;
  updated_at: Date;
}

export class UserModel {
  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<User | null> {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  static async create(
    email: string,
    passwordHash: string,
    name?: string
  ): Promise<User> {
    const result = await pool.query(
      "INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at, updated_at",
      [email, passwordHash, name || "Usuário"]
    );
    return result.rows[0];
  }

  static async getPasswordHash(email: string): Promise<string | null> {
    const result = await pool.query(
      "SELECT password_hash FROM users WHERE email = $1",
      [email]
    );
    return result.rows[0]?.password_hash || null;
  }

  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static async updateName(id: string, name: string): Promise<User | null> {
    const result = await pool.query(
      "UPDATE users SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, name, created_at, updated_at",
      [name, id]
    );
    return result.rows[0] || null;
  }
}
