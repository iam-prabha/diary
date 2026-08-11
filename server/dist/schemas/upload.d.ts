import { z } from 'zod';
export declare const confirmUploadSchema: z.ZodObject<{
    entryId: z.ZodOptional<z.ZodString>;
    publicId: z.ZodString;
    url: z.ZodString;
    mimeType: z.ZodString;
    size: z.ZodNumber;
    width: z.ZodOptional<z.ZodNumber>;
    height: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type ConfirmUploadInput = z.infer<typeof confirmUploadSchema>;
//# sourceMappingURL=upload.d.ts.map