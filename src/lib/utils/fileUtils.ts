import fs from 'fs'
import path from 'path'

const uploadsDir = path.join(process.cwd(), 'uploads')
const provesDir = path.join(uploadsDir, 'proves')

export interface FileInfo {
  originalName: string
  filename: string
  path: string
  size: number
  mimetype: string
}

export function getFileInfo(file: Express.Multer.File): FileInfo {
  return {
    originalName: file.originalname,
    filename: file.filename,
    path: file.path,
    size: file.size,
    mimetype: file.mimetype
  }
}

export function deleteFile(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

export function getFilePath(filename: string): string {
  return path.join(provesDir, filename)
}

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath)
}

export function getFileSize(filePath: string): number {
  try {
    const stats = fs.statSync(filePath)
    return stats.size
  } catch (error) {
    return 0
  }
}

export function getFileExtension(filename: string): string {
  return path.extname(filename).toLowerCase()
}

export function isImageFile(mimetype: string): boolean {
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  return imageTypes.includes(mimetype)
}

export function isDocumentFile(mimetype: string): boolean {
  const docTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  return docTypes.includes(mimetype)
}

export function getFileType(mimetype: string): 'image' | 'document' {
  if (isImageFile(mimetype)) {
    return 'image'
  }
  if (isDocumentFile(mimetype)) {
    return 'document'
  }
  return 'document' // fallback
} 