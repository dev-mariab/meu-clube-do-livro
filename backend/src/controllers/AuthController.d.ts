import { Request, Response } from "express";
export declare class AuthController {
    static signup(req: Request, res: Response): Promise<void>;
    static login(req: Request, res: Response): Promise<void>;
    static getMe(req: Request, res: Response): Promise<void>;
    static updateProfile(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=AuthController.d.ts.map