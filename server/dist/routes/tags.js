import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';
import { createTagSchema } from '../schemas/tags.js';
const router = Router();
router.use(requireAuth);
router.get('/', asyncHandler(async (req, res) => {
    const userId = req.userId;
    const tags = await prisma.tag.findMany({
        where: {
            entries: { some: { entry: { userId } } },
        },
        include: {
            _count: { select: { entries: true } },
        },
        orderBy: { entries: { _count: 'desc' } },
    });
    res.json({
        tags: tags.map(t => ({
            id: t.id,
            name: t.name,
            color: t.color,
            count: t._count.entries,
        })),
    });
}));
router.post('/', validate(createTagSchema), asyncHandler(async (req, res) => {
    const { name, color } = req.body;
    const tag = await prisma.tag.upsert({
        where: { name },
        update: color ? { color } : {},
        create: { name, color: color || '#c4785e' },
    });
    res.status(201).json(tag);
}));
export default router;
//# sourceMappingURL=tags.js.map