import { v2 as cloudinary, type UploadApiOptions } from 'cloudinary'
import { env } from './keys.js'
import logger from './logger.js'

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_SECRET_KEY,
  secure: true,
})

function getUploadErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'error' in error) {
    const detail = (error as { error?: { message?: unknown } }).error
    if (detail && typeof detail.message === 'string') return detail.message
  }
  if (error instanceof Error) return error.message
  return 'Unknown error'
}

export const uploadToCloudinary = async (file: string, options: Partial<UploadApiOptions> = {}) => {
  try {
    const defaultOptions: UploadApiOptions = {
      folder: 'TSAPortfolio',
      resource_type: 'auto',
      // Image optimization settings
      quality: 'auto',
      fetch_format: 'auto',
      // Performance optimization
      responsive_breakpoints: {
        create_derived: true,
        transformation: {
          quality: 'auto:good',
          fetch_format: 'auto',
        },
      },
      secure: true,
      optimize: true,
      ...options,
    }

    const uploadResponse = await cloudinary.uploader.upload(file, defaultOptions)
    return {
      mediaUrl: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
    }
  } catch (error) {
    const message = getUploadErrorMessage(error)
    logger.error(`Upload failed: ${message}`)
    throw new Error(`Upload failed: ${message}`)
  }
}

export const deleteFromCloudinary = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    const message = getUploadErrorMessage(error)
    logger.error(`Deletion failed: ${message}`)
    throw new Error(`Deletion failed: ${message}`)
  }
}
