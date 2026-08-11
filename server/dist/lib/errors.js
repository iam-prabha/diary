export class AppError extends Error {
    code;
    statusCode;
    details;
    constructor(code, message, statusCode = 400, details) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'AppError';
    }
    static badRequest(code, message, details) {
        return new AppError(code, message, 400, details);
    }
    static notFound(code, message) {
        return new AppError(code, message, 404);
    }
    static unauthorized(code, message) {
        return new AppError(code, message, 401);
    }
    static internal(message = 'Internal server error') {
        return new AppError('INTERNAL_ERROR', message, 500);
    }
}
export class ValidationError extends AppError {
    constructor(details) {
        super('VALIDATION_ERROR', 'Invalid request data', 400, details);
        this.name = 'ValidationError';
    }
}
//# sourceMappingURL=errors.js.map