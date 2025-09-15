import { uploadSingle, handleUploadError } from "../middlewares/uploadMiddleware"
import { type Request, type Response } from "express"
import { JwtAuth } from "../lib/utils/authHelpers"
import express from "express"
import { ErrorResponse } from "../domain/dto/ErrorResponse"
import { FileUploadResponse } from "./interfaces/uploadFiles"
import { uploadFilesService } from "../services/uploadFilesService"
import { HttpError } from "../lib/error/Error"

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
      const errorMessage =
        error instanceof HttpError
          ? { message: error.message, status: error.statusCode }
          : { message: "Что-то пошло не так, попробуйте позже", status: 500 }
      console.error("Error logging out:", error)
      return res.status(errorMessage.status).json({ error: errorMessage.message })
    }
  }
)

export default router
