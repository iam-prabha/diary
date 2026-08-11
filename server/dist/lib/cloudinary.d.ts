import { v2 as cloudinary } from "cloudinary";
export declare const UPLOAD_FOLDER = "diary";
export declare function getSignedUploadParams(folder?: string, preset?: string): {
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    uploadPreset: string;
    folder: string;
};
export declare function getOptimizedUrl(publicId: string, options?: {
    width?: number;
    height?: number;
    quality?: string;
}): string;
export default cloudinary;
//# sourceMappingURL=cloudinary.d.ts.map