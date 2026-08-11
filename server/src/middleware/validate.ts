import type { Request, Response, NextFunction } from 'express'
import type { ZodSchema } from 'zod'
import { ValidationError } from '../lib/errors.js'

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      return next(new ValidationError(result.error.flatten()))
    }
    req.body = result.data
    next()
  }
}

// Express 5 makes req.query read-only; store parsed values on the request instead.
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query)
    if (!result.success) {
      return next(new ValidationError(result.error.flatten()))
    }
    ;(req as Request & { validatedQuery: unknown }).validatedQuery = result.data
    next()
  }
}
