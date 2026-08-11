import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { errorHandler } from './middleware/errorHandler.js'
import { rateLimit } from './middleware/rateLimit.js'
import { env } from './lib/env.js'
import prisma from './lib/prisma.js'
import healthRouter from './routes/health.js'
import authRouter from './routes/auth.js'
import entriesRouter from './routes/entries.js'
import tagsRouter from './routes/tags.js'
import uploadRouter from './routes/upload.js'

const app = express()
const PORT = env.PORT

app.set('trust proxy', 1)

app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`)
  })
  next()
})

app.use(rateLimit(100, 60_000))

app.use('/api/health', healthRouter)
app.use('/api/auth', authRouter)
app.use('/api/entries', entriesRouter)
app.use('/api/tags', tagsRouter)
app.use('/api/upload', uploadRouter)

app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } })
})

app.use(errorHandler)

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
    console.log(`📊 Health: http://localhost:${PORT}/api/health`)
  })
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully')
  await prisma.$disconnect()
  process.exit(0)
})

export default app
