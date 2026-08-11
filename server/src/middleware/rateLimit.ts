import type { Request, Response, NextFunction } from 'express'

const requests = new Map<string, { count: number; resetAt: number }>()

export const rateLimit = (maxRequests = 100, windowMs = 60_000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || 'unknown'
    const now = Date.now()
    const record = requests.get(ip)

    if (!record || now > record.resetAt) {
      requests.set(ip, { count: 1, resetAt: now + windowMs })
      return next()
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({
        error: { code: 'RATE_LIMITED', message: 'Too many requests' },
      })
    }

    record.count++
    next()
  }
}

setInterval(() => {
  const now = Date.now()
  for (const [ip, record] of requests.entries()) {
    if (now > record.resetAt) requests.delete(ip)
  }
}, 5 * 60 * 1000)
