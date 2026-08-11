export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 400,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
  }

  static badRequest(code: string, message: string, details?: unknown) {
    return new AppError(code, message, 400, details)
  }

  static notFound(code: string, message: string) {
    return new AppError(code, message, 404)
  }

  static unauthorized(code: string, message: string) {
    return new AppError(code, message, 401)
  }

  static internal(message: string = 'Internal server error') {
    return new AppError('INTERNAL_ERROR', message, 500)
  }
}

export class ValidationError extends AppError {
  constructor(details: unknown) {
    super('VALIDATION_ERROR', 'Invalid request data', 400, details)
    this.name = 'ValidationError'
  }
}
