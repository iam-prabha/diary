import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import prisma from '../lib/prisma.js';
import { getSignedUploadParams, UPLOAD_FOLDER } from '../lib/cloudinary.js';
import { confirmUploadSchema } from '../schemas/upload.js';
import cloudinary from '../lib/cloudinary.js';
import { asParam } from '../utils/cast.js';
const router = Router();
router.get('/sign', asyncHandler(async (req, res) => {
    const folder = typeof req.query.folder === 'string' ? req.query.folder : UPLOAD_FOLDER;
    const preset = typeof req.query.preset === 'string' ? req.query.preset : undefined;
    const params = getSignedUploadParams(folder, preset);
    res.json(params);
}));
router.post('/confirm', validate(confirmUploadSchema), asyncHandler(async (req, res) => {
    const { entryId, publicId, url, mimeType, size, width, height } = req.body;
    const media = await prisma.media.create({
        data: {
            entryId: entryId || null,
            url,
            mimeType,
            size,
            width,
            height,
            cloudinaryId: publicId,
        },
    });
    res.status(201).json(media);
}));
router.delete('/:publicId', asyncHandler(async (req, res) => {
    const publicId = asParam(req.params.publicId);
    try {
        await cloudinary.uploader.destroy(publicId);
    }
    catch (e) {
        console.warn('Cloudinary destroy failed:', e);
    }
    await prisma.media.deleteMany({ where: { cloudinaryId: publicId } });
    res.status(204).send();
}));
export default router;
//# sourceMappingURL=upload.js.map