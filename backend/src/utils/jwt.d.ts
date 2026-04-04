export interface JWTPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}
export declare function generateToken(userId: string, email: string): string;
export declare function verifyToken(token: string): JWTPayload;
export declare function decodeToken(token: string): JWTPayload | null;
//# sourceMappingURL=jwt.d.ts.map