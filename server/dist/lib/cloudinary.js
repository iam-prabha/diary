import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";
cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
});
export const UPLOAD_FOLDER = "diary";
export function getSignedUploadParams(folder = UPLOAD_FOLDER, preset = env.CLOUDINARY_UPLOAD_PRESET) {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request({ timestamp, folder, upload_preset: preset }, env.CLOUDINARY_API_SECRET);
    return {
        signature,
        timestamp,
        apiKey: env.CLOUDINARY_API_KEY,
        cloudName: env.CLOUDINARY_CLOUD_NAME,
        uploadPreset: preset,
        folder,
    };
}
export function getOptimizedUrl(publicId, options = {}) {
    return cloudinary.url(publicId, {
        fetch_format: "auto",
        quality: options.quality || "auto",
        width: options.width,
        height: options.height,
        crop: options.width || options.height ? "fill" : undefined,
        gravity: "auto",
    });
}
export default cloudinary;
//# sourceMappingURL=cloudinary.js.map