export interface User {
    id: string;
    email: string;
    name?: string;
    created_at: Date;
    updated_at: Date;
}
export interface UserWithPassword extends User {
    password_hash: string;
}
export declare class UserModel {
    static findByEmail(email: string): Promise<User | null>;
    static findByEmailWithPassword(email: string): Promise<UserWithPassword | null>;
    static findById(id: string): Promise<User | null>;
    static create(email: string, passwordHash: string, name?: string): Promise<User>;
    static hashPassword(password: string): Promise<string>;
    static verifyPassword(password: string, hash: string): Promise<boolean>;
    static updateName(id: string, name: string): Promise<User | null>;
}
//# sourceMappingURL=User.d.ts.map