import { uploadSingle, handleUploadError } from "../middlewares/uploadMiddleware.js"
import { type Request, type Response } from "express"
import { JwtAuth } from "../lib/utils/authHelpers.js"
import express from "express"
import { ErrorResponse } from "../domain/dto/ErrorResponse.js"
import { FileUploadResponse } from "./interfaces/uploadFiles.js"
import { uploadFilesService } from "../services/uploadFilesService.js"

const router = express.Router()
router.use(JwtAuth)

router.post(
  "/upload",
  uploadSingle,
  handleUploadError,
  async (req: Request, res: Response<FileUploadResponse | ErrorResponse>) => {
    try {
      const file = req.file as Express.Multer.File | undefined
      const result = await uploadFilesService({ file })

      res.status(201).json(result)
    } catch (error) {
      console.error("Error uploading file:", error)
      return res.status(500).json({ error: error instanceof Error ? error.message : "Internal server error" })
    }
  }
)

export default router
