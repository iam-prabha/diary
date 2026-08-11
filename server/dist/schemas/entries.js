import { z } from 'zod';
export const createEntrySchema = z.object({
    title: z.string().min(1).max(200),
    content: z.string().min(1),
    contentText: z.string().optional(),
    tags: z.array(z.string()).max(30).optional(),
    media: z.array(z.object({
        url: z.string().url(),
        mimeType: z.string(),
        size: z.number().int().positive(),
        width: z.number().int().positive().optional(),
        height: z.number().int().positive().optional(),
        cloudinaryId: z.string(),
    })).max(20).optional(),
});
export const updateEntrySchema = createEntrySchema.partial();
export const entryQuerySchema = z.object({
    q: z.string().optional(),
    tag: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(20),
    sort: z.enum(['createdAt:desc', 'createdAt:asc', 'publishedAt:desc', 'publishedAt:asc']).default('createdAt:desc'),
    cursor: z.string().optional(),
});
//# sourceMappingURL=entries.js.map