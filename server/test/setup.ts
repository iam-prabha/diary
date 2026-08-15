import { beforeAll } from 'vitest'
import prisma from '../src/lib/prisma.js'

beforeAll(async () => {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "media", "entry_tags", "entries", "tags", "users" RESTART IDENTITY CASCADE',
  )
})
