declare const pool: import("pg").Pool;
export { pool };
export declare function initializeDatabase(): Promise<void>;
export declare function runMigrations(): Promise<void>;
//# sourceMappingURL=database.d.ts.map