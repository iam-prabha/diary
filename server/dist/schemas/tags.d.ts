import { z } from 'zod';
export declare const createTagSchema: z.ZodObject<{
    name: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    color: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
//# sourceMappingURL=tags.d.ts.map