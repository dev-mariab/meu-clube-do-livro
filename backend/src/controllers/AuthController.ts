import { Request, Response } from "express";
import { UserModel } from "../models/User.js";
import { generateToken } from "../utils/jwt.js";

export class AuthController {
  static async signup(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        res
          .status(400)
          .json({ error: "Email and password are required" });
        return;
      }

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        res.status(400).json({ error: "Email already registered" });
        return;
      }

      // Hash password
      const passwordHash = await UserModel.hashPassword(password);

      // Create user
      const user = await UserModel.create(email, passwordHash, name);

      // Generate token
      const token = generateToken(user.id, user.email);

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      });
    } catch (error) {
      console.error("[AuthController] Signup error:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res
          .status(400)
          .json({ error: "Email and password are required" });
        return;
      }

      // Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        res.status(401).json({ error: "Invalid login credentials" });
        return;
      }

      // Verify password
      const passwordHash = await UserModel.getPasswordHash(email);
      if (!passwordHash) {
        res.status(401).json({ error: "Invalid login credentials" });
        return;
      }

      const isValid = await UserModel.verifyPassword(password, passwordHash);
      if (!isValid) {
        res.status(401).json({ error: "Invalid login credentials" });
        return;
      }

      // Generate token
      const token = generateToken(user.id, user.email);

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      });
    } catch (error) {
      console.error("[AuthController] Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  }

  static async getMe(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const user = await UserModel.findById(req.user.userId);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
      });
    } catch (error) {
      console.error("[AuthController] Get user error:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  }
}
