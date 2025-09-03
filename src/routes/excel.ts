import express, { type Request, type Response } from "express"
import prisma from "../prisma.js"
import { StatusEnum } from "../domain/models/StatusEnum.js"
import { isAdmin } from "../middlewares/authMiddleware.js"
import { createTable } from "../lib/utils/createTable.js"
import { JwtAuth } from "../lib/utils/authHelpers.js"

const router = express.Router()

router.use(JwtAuth)

router.get(
  "/export/table",
  isAdmin,
  async (
    req: Request<{}, {}, {}, { courseId?: string; groupId?: string; startDate?: string; endDate?: string }>,
    res: Response
  ) => {
    try {
      const { courseId, groupId, endDate, startDate } = req.query

      const tickets = await prisma.ticket.findMany({
        where: {
          endDate: { lte: endDate },
          status: StatusEnum.APPROVED,
          startDate: { gte: startDate },
          user: {
            ...(courseId ? { courseId } : {}),
            ...(groupId ? { groupId } : {}),
          },
        },
        include: {
          user: {
            include: {
              course: { select: { id: true, identifier: true, name: true } },
              group: { select: { id: true, identifier: true } },
            },
          },
          prooves: true,
        },
        orderBy: { startDate: "desc" },
      })

      const columns = [
        { header: "Имя", key: "name", width: 30 },
        { header: "Пользователь", key: "userName", width: 28 },
        { header: "Курс", key: "course", width: 20 },
        { header: "Группа", key: "group", width: 12 },
        { header: "Причина", key: "reason", width: 15 },
        { header: "С даты", key: "startDate", width: 22 },
        { header: "По дату", key: "endDate", width: 22 },
        { header: "Описание", key: "description", width: 40 },
      ]

      const tableResult = await createTable(columns, tickets as any)

      const fileNameParts = ["tickets"]
      if (courseId) fileNameParts.push(`course-${courseId}`)
      if (groupId) fileNameParts.push(`group-${groupId}`)
      const fileName = fileNameParts.join("_") + ".xlsx"

      // create buffer from workbook and send it
      const buffer = await tableResult.xlsx.writeBuffer()
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
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
