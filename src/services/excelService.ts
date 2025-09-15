import { HttpError } from "../lib/error/Error"
import { createTable } from "../lib/utils/createTable"
import { ExcelServiceExportPayload, ExcelServiceExportResponse } from "./interfaces/excel"
import { Buffer } from "buffer"
import { excelRepository } from "../repository/excelRepository"

export async function excelService({
  endDate,
  startDate,
  courseId,
  groupId,
}: ExcelServiceExportPayload): Promise<ExcelServiceExportResponse> {
  const { tickets } = await excelRepository({
    endDate,
    startDate,
    courseId,
    groupId,
  })

  if (tickets.length === 0) {
    throw new HttpError("Заявок удовлетворяющих критериям не найдено", 404)
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
  if (courseId) fileNameParts.push(`курс-${tickets[0].user.group?.course?.identifier || courseId}`)
  if (groupId) fileNameParts.push(`группа-${tickets[0].user.group?.identifier || groupId}`)
  const fileName = fileNameParts.join("_") + ".xlsx"

  const buffer = Buffer.from((await tableResult.xlsx.writeBuffer()) as any)

  return { buffer, fileName }
}
