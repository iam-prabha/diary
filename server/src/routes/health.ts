import { Router } from 'express'
import { asyncHandler } from '../utils/asyncHandler.js'
import prisma from '../lib/prisma.js'

const router = Router()

router.get('/', asyncHandler(async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'connected',
  })
}))

export default router
