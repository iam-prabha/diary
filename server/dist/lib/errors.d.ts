export declare class AppError extends Error {
    readonly code: string;
    readonly statusCode: number;
    readonly details?: unknown | undefined;
    constructor(code: string, message: string, statusCode?: number, details?: unknown | undefined);
    static badRequest(code: string, message: string, details?: unknown): AppError;
    static notFound(code: string, message: string): AppError;
    static unauthorized(code: string, message: string): AppError;
    static internal(message?: string): AppError;
}
export declare class ValidationError extends AppError {
    constructor(details: unknown);
}
//# sourceMappingURL=errors.d.ts.map