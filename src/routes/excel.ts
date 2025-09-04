import express, { type Request, type Response } from "express"
import { isAdmin } from "../middlewares/authMiddleware.js"
import { JwtAuth } from "../lib/utils/authHelpers.js"
import { setResponseExcelHeaders } from "../middlewares/excelMiddleware.js"
import { ExcelExportPayload } from "./interfaces/excel.js"
import { excelService } from "../services/excelService.js"
import { HttpError } from "../lib/error/Error.js"

const router = express.Router()

router.use(JwtAuth)

router.get(
  "/export/table",
  isAdmin,
  setResponseExcelHeaders,
  async (req: Request<{}, {}, {}, ExcelExportPayload>, res: Response) => {
    try {
      const { courseId, groupId, endDate, startDate } = req.query

      const { buffer, fileName } = await excelService({ courseId, groupId, endDate, startDate })

      // provide both plain and RFC5987-encoded filename to support non-ASCII names
      const disposition = `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`
      res.setHeader("Content-Disposition", disposition)
      res.setHeader("Content-Length", buffer.byteLength.toString())
      res.status(200).send(buffer)
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
