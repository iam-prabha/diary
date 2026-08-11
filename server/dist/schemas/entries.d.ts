import { z } from 'zod';
export declare const createEntrySchema: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodString;
    contentText: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    media: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        mimeType: z.ZodString;
        size: z.ZodNumber;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
        cloudinaryId: z.ZodString;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const updateEntrySchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    contentText: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    tags: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    media: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        mimeType: z.ZodString;
        size: z.ZodNumber;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
        cloudinaryId: z.ZodString;
    }, z.core.$strip>>>>;
}, z.core.$strip>;
export declare const entryQuerySchema: z.ZodObject<{
    q: z.ZodOptional<z.ZodString>;
    tag: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    sort: z.ZodDefault<z.ZodEnum<{
        "createdAt:desc": "createdAt:desc";
        "createdAt:asc": "createdAt:asc";
        "publishedAt:desc": "publishedAt:desc";
        "publishedAt:asc": "publishedAt:asc";
    }>>;
    cursor: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateEntryInput = z.infer<typeof createEntrySchema>;
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;
export type EntryQueryInput = z.infer<typeof entryQuerySchema>;
//# sourceMappingURL=entries.d.ts.map