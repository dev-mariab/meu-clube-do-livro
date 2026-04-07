import { UserModel } from "../models/User.js";
import { generateToken } from "../utils/jwt.js";
export class AuthController {
    static async signup(req, res) {
        try {
            const { email, password, name } = req.body;
            if (!email || !password) {
                res
                    .status(400)
                    .json({ error: "Email and password are required" });
                return;
            }
            console.log("Tentativa de cadastro com email:", email);
            console.log("Dados recebidos:", req.body);
            // Check if user already exists
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                console.log("Email já registrado");
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
        }
        catch (error) {
            console.error("[AuthController] Signup error:", error);
            res.status(500).json({ error: "Failed to create account" });
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                console.log("[AuthController] Missing email or password");
                res.status(400).json({ error: "Email and password are required" });
                return;
            }
            console.log(`[AuthController] Login attempt for: ${email}`);
            console.log("[AuthController] STEP 1 - before findByEmailWithPassword");
            const user = await UserModel.findByEmailWithPassword(email);
            console.log("[AuthController] STEP 2 - after findByEmailWithPassword", !!user);
            if (!user) {
                console.log(`[AuthController] User not found: ${email}`);
                res.status(401).json({ error: "Invalid login credentials" });
                return;
            }
            console.log("[AuthController] STEP 3 - before verifyPassword");
            const isValid = await UserModel.verifyPassword(password, user.password_hash);
            console.log("[AuthController] STEP 4 - after verifyPassword", isValid);
            if (!isValid) {
                console.log(`[AuthController] Invalid password for: ${email}`);
                res.status(401).json({ error: "Invalid login credentials" });
                return;
            }
            console.log("[AuthController] STEP 5 - before generateToken");
            const token = generateToken(user.id, user.email);
            console.log("[AuthController] STEP 6 - after generateToken");
            console.log(`[AuthController] Login successful for: ${email}`);
            res.json({
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
                token,
            });
        }
        catch (error) {
            console.error("[AuthController] Login error:", error);
            res.status(500).json({ error: "Failed to login" });
        }
    }
    static async getMe(req, res) {
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
        }
        catch (error) {
            console.error("[AuthController] Get user error:", error);
            res.status(500).json({ error: "Failed to fetch user" });
        }
    }
    static async updateProfile(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            const { name } = req.body;
            if (!name || name.trim() === "") {
                res.status(400).json({ error: "Name is required" });
                return;
            }
            const updatedUser = await UserModel.updateName(req.user.userId, name);
            if (!updatedUser) {
                res.status(404).json({ error: "User not found" });
                return;
            }
            res.json({
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
            });
        }
        catch (error) {
            console.error("[AuthController] Update profile error:", error);
            res.status(500).json({ error: "Failed to update profile" });
        }
    }
}
//# sourceMappingURL=AuthController.js.map