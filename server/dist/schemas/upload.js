import { z } from 'zod';
export const confirmUploadSchema = z.object({
    entryId: z.string().optional(),
    publicId: z.string().min(1),
    url: z.string().url(),
    mimeType: z.string(),
    size: z.number().int().positive(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
});
//# sourceMappingURL=upload.js.map