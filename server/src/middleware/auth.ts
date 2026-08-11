import type { Request, Response, NextFunction } from 'express'
import { verifySession } from '../lib/session.js'
import { AppError } from '../lib/errors.js'

export interface AuthedRequest extends Request {
  userId: string
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const userId = verifySession(req)
  if (!userId) {
    next(AppError.unauthorized('UNAUTHORIZED', 'Please sign in to continue'))
    return
  }
  ;(req as AuthedRequest).userId = userId
  next()
}
