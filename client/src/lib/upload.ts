import { api } from './api'

export interface UploadResult {
  url: string
  publicId: string
  width: number
  height: number
  size: number
  mimeType: string
}

export async function uploadImage(file: File, onProgress?: (percent: number) => void): Promise<UploadResult> {
  const sign = await api.get<{
    signature: string
    timestamp: number
    apiKey: string
    cloudName: string
    uploadPreset: string
    folder: string
  }>('/upload/sign')

  const { cloudName, uploadPreset, folder, timestamp, signature, apiKey } = sign.data

  const formData = new FormData()
  formData.append('file', file)
  formData.append('cloud_name', cloudName)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', folder)
  formData.append('timestamp', String(timestamp))
  formData.append('signature', signature)
  formData.append('api_key', apiKey)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      if (xhr.status === 200) {
        const { secure_url, public_id, width, height, bytes, format } = JSON.parse(xhr.responseText)
        resolve({
          url: secure_url,
          publicId: public_id,
          width,
          height,
          size: bytes,
          mimeType: `image/${format}`,
        })
      } else {
        reject(new Error('Upload failed'))
      }
    }
    xhr.onerror = () => reject(new Error('Upload failed'))
    xhr.send(formData)
  })
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    await api.delete(`/upload/${encodeURIComponent(publicId)}`)
  } catch {
    // best-effort cleanup
  }
}
