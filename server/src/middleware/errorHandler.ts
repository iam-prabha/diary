import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { AppError, ValidationError } from '../lib/errors.js'

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('❌ Error:', err)

  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details },
    })
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: err.flatten() },
    })
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    })
  }

  const prismaErr = err as { name?: string; code?: string }
  if (prismaErr.name === 'PrismaClientKnownRequestError') {
    if (prismaErr.code === 'P2002') {
      return res.status(409).json({ error: { code: 'CONFLICT', message: 'Record already exists' } })
    }
    if (prismaErr.code === 'P2025') {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Record not found' } })
    }
  }

  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
  })
}
