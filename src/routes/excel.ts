import express, { type Request, type Response } from "express"
import { isAdmin } from "../middlewares/authMiddleware.js"
import { JwtAuth } from "../lib/utils/authHelpers.js"
import { setResponseExcelHeaders } from "../middlewares/excelMiddleware.js"
import { ExcelExportPayload } from "./interfaces/excel.js"
import { excelService } from "../services/excelService.js"

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
      console.error("Error exporting tickets XLS:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }
)

export default router
