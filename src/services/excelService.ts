import { StatusEnum } from "../domain/models/StatusEnum.js"
import { createTable } from "../lib/utils/createTable.js"
import prisma from "../prisma.js"
import { ExcelServiceExportPayload, ExcelServiceExportResponse } from "./interfaces/excel.js"
import { Buffer } from "buffer"

export async function excelService({
  endDate,
  startDate,
  courseId,
  groupId,
}: ExcelServiceExportPayload): Promise<ExcelServiceExportResponse> {
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

  if (tickets.length === 0) {
    throw new Error("Заявок удовлетворяющих критериям не найдено")
  }

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
  if (courseId) fileNameParts.push(`курс-${tickets[0].user.course?.identifier || courseId}`)
  if (groupId) fileNameParts.push(`группа-${tickets[0].user.group?.identifier || groupId}`)
  const fileName = fileNameParts.join("_") + ".xlsx"

  const buffer = Buffer.from((await tableResult.xlsx.writeBuffer()) as any)

  return { buffer, fileName }
}
