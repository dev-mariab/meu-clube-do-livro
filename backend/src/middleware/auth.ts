import { Request, Response, NextFunction } from "express";
import { verifyToken, JWTPayload } from "../utils/jwt.js";

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: "Unauthorized - Missing authorization header" });
      return;
    }

    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ error: "Unauthorized - Invalid authorization format" });
      return;
    }

    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    console.error("[Auth] Token verification failed:", error);
    res.status(401).json({ error: "Unauthorized - Invalid token" });
  }
}

export function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const payload = verifyToken(token);
      req.user = payload;
    }
  } catch (error) {
    // Ignore errors for optional auth
  }

  next();
}
