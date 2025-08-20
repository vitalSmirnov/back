import multer from "multer"
import path from "path"
import fs from "fs"

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads")
const provesDir = path.join(uploadsDir, "proves")

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}
if (!fs.existsSync(provesDir)) {
  fs.mkdirSync(provesDir, { recursive: true })
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, provesDir)
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, `prove-${uniqueSuffix}${ext}`)
  },
})

// File filter for allowed file types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow images
  const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png"]
  // Allow documents
  const allowedDocTypes = ["application/pdf", "application/msword"]

  if (allowedImageTypes.includes(file.mimetype) || allowedDocTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Invalid file type. Only images (JPEG, PNG, GIF, WebP) and documents (PDF, DOC, DOCX) are allowed."))
  }
}

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5, // Maximum 5 files per request
  },
})

// Single file upload
export const uploadSingle = upload.single("file")

// Multiple files upload

// Error handling middleware
export const handleUploadError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large. Maximum size is 10MB." })
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ error: "Too many files. Maximum is 5 files." })
    }
    return res.status(400).json({ error: err.message })
  }

  if (err.message.includes("Invalid file type")) {
    return res.status(400).json({ error: err.message })
  }

  next(err)
}

export default upload
