import { Request, Response } from "express";
export declare class BooksController {
    static getBooks(req: Request, res: Response): Promise<void>;
    static getBook(req: Request, res: Response): Promise<void>;
    static createBook(req: Request, res: Response): Promise<void>;
    static updateBook(req: Request, res: Response): Promise<void>;
    static deleteBook(req: Request, res: Response): Promise<void>;
    static getStats(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=BooksController.d.ts.map