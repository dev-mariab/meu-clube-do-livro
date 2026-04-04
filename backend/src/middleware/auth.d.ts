import { Request, Response, NextFunction } from "express";
import { JWTPayload } from "../utils/jwt.js";
declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}
export declare function authMiddleware(req: Request, res: Response, next: NextFunction): void;
export declare function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map