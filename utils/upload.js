import multer from 'multer'
import cloudinary from '../config/cloudinary.js'

const storage = multer.memoryStorage()
export const upload = multer({ storage })

export function uploadToCloudinary(buffer, folder = 'portfolio') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error)
      resolve(result)
    })
    stream.end(buffer)
  })
}
