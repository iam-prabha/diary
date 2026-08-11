import { Router, type Request } from 'express'
import { asyncHandler } from '../utils/asyncHandler.js'
import { validate, validateQuery } from '../middleware/validate.js'
import { AppError } from '../lib/errors.js'
import { requireAuth, type AuthedRequest } from '../middleware/auth.js'
import prisma from '../lib/prisma.js'
import { entryInclude, extractTextFromTipTap } from '../utils/entryHelpers.js'
import { asString, asNumber, asParam } from '../utils/cast.js'
import { createEntrySchema, updateEntrySchema, entryQuerySchema } from '../schemas/entries.js'

const router = Router()

router.use(requireAuth)

const SORT_FIELDS: Record<string, 'createdAt' | 'publishedAt'> = {
  'createdAt:desc': 'createdAt',
  'createdAt:asc': 'createdAt',
  'publishedAt:desc': 'publishedAt',
  'publishedAt:asc': 'publishedAt',
}

const SORT_ORDERS: Record<string, 'desc' | 'asc'> = {
  'createdAt:desc': 'desc',
  'createdAt:asc': 'asc',
  'publishedAt:desc': 'desc',
  'publishedAt:asc': 'asc',
}

router.get('/', validateQuery(entryQuerySchema), asyncHandler(async (req, res) => {
  const query = (req as Request & { validatedQuery: Record<string, unknown> }).validatedQuery
  const q = asString(query.q)
  const tag = asString(query.tag)
  const page = asNumber(query.page, 1)
  const limit = asNumber(query.limit, 20)
  const sort = asString(query.sort) ?? 'createdAt:desc'
  const cursor = asString(query.cursor)
  const userId = (req as AuthedRequest).userId

  const where: Record<string, unknown> = { userId }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { contentText: { contains: q, mode: 'insensitive' } },
    ]
  }

  if (tag) {
    where.tags = { some: { tag: { name: tag } } }
  }

  // Cursor pagination (keyset) when cursor is provided
  if (cursor) {
    where.id = { lt: cursor }
    const orderBy = { [SORT_FIELDS[sort]]: SORT_ORDERS[sort] } as const
    const entries = await prisma.entry.findMany({
      where,
      take: limit + 1,
      orderBy,
      include: entryInclude,
    })

    let hasMore = false
    if (entries.length > limit) {
      hasMore = true
      entries.pop()
    }

    return res.json({
      entries,
      nextCursor: hasMore ? entries[entries.length - 1]?.id : null,
      hasMore,
    })
  }

  const orderBy = { [SORT_FIELDS[sort]]: SORT_ORDERS[sort] } as const
  const [entries, total] = await Promise.all([
    prisma.entry.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
      include: entryInclude,
    }),
    prisma.entry.count({ where }),
  ])

  res.json({
    entries,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}))

router.post('/', validate(createEntrySchema), asyncHandler(async (req, res) => {
  const userId = (req as AuthedRequest).userId
  const { title, content, contentText, tags = [], media = [] } = req.body

  const searchText = contentText || extractTextFromTipTap(content)

  const entry = await prisma.entry.create({
    data: {
      title,
      content,
      contentText: searchText,
      publishedAt: new Date(),
      userId,
      tags: {
        create: tags.map((name: string) => ({
          tag: { connectOrCreate: { where: { name }, create: { name } } },
        })),
      },
      media: {
        create: media.map((m: Record<string, unknown>) => ({
          url: m.url as string,
          mimeType: m.mimeType as string,
          size: m.size as number,
          width: m.width as number | undefined,
          height: m.height as number | undefined,
          cloudinaryId: m.cloudinaryId as string,
        })),
      },
    },
    include: entryInclude,
  })

  res.status(201).json(entry)
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const userId = (req as AuthedRequest).userId
  const entry = await prisma.entry.findFirst({
    where: { id: asParam(req.params.id), userId },
    include: entryInclude,
  })

  if (!entry) throw AppError.notFound('NOT_FOUND', 'Entry not found')
  res.json(entry)
}))

router.patch('/:id', validate(updateEntrySchema), asyncHandler(async (req, res) => {
  const userId = (req as AuthedRequest).userId
  const { title, content, contentText, tags, media } = req.body

  const existing = await prisma.entry.findFirst({ where: { id: asParam(req.params.id), userId } })
  if (!existing) throw AppError.notFound('NOT_FOUND', 'Entry not found')

  const searchText = contentText || (content ? extractTextFromTipTap(content) : existing.contentText)

  const entry = await prisma.entry.update({
    where: { id: asParam(req.params.id) },
    data: {
      title,
      content,
      contentText: searchText,
      tags: tags
        ? {
            deleteMany: {},
            create: tags.map((name: string) => ({
              tag: { connectOrCreate: { where: { name }, create: { name } } },
            })),
          }
        : undefined,
      media: media
        ? {
            deleteMany: {},
            create: media.map((m: Record<string, unknown>) => ({
              url: m.url as string,
              mimeType: m.mimeType as string,
              size: m.size as number,
              width: m.width as number | undefined,
              height: m.height as number | undefined,
              cloudinaryId: m.cloudinaryId as string,
            })),
          }
        : undefined,
    },
    include: entryInclude,
  })

  res.json(entry)
}))

router.delete('/:id', asyncHandler(async (req, res) => {
  const userId = (req as AuthedRequest).userId
  const existing = await prisma.entry.findFirst({ where: { id: asParam(req.params.id), userId } })
  if (!existing) throw AppError.notFound('NOT_FOUND', 'Entry not found')

  await prisma.entry.delete({ where: { id: asParam(req.params.id) } })
  res.status(204).send()
}))

export default router
