import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "sua_chave_secreta";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
export function generateToken(userId, email) {
    return jwt.sign({ userId, email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
}
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    }
    catch (error) {
        throw new Error("Invalid or expired token");
    }
}
export function decodeToken(token) {
    try {
        return jwt.decode(token);
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=jwt.js.map