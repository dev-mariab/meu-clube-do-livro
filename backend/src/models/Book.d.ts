export interface Book {
    id: string;
    user_id: string;
    title: string;
    author?: string;
    isbn?: string;
    category?: string;
    status: "reading" | "completed" | "want-to-read";
    progress: number;
    current_page: number;
    total_pages: number;
    cover_url?: string;
    rating?: number;
    review?: string;
    completed_at?: Date;
    created_at: Date;
    updated_at: Date;
}
export declare class BookModel {
    static findByUserId(userId: string): Promise<Book[]>;
    static findById(id: string): Promise<Book>;
    static create(bookData: Omit<Book, "id" | "created_at" | "updated_at">): Promise<Book>;
    static update(id: string, updates: Partial<Book>): Promise<Book>;
    static delete(id: string): Promise<void>;
    static getStatsByUserId(userId: string): Promise<{
        booksRead: number;
        currentlyReading: number;
        pagesThisYear: number;
    }>;
}
//# sourceMappingURL=Book.d.ts.map