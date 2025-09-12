import { StatusEnum } from "../domain/models/StatusEnum.js"
import { HttpError } from "../lib/error/Error.js"
import prisma from "../prisma.js"
import { ExcelRepositoryExportPayload, ExcelRepositoryExportResponse } from "./interfaces/excel.js"

export async function excelRepository({
  endDate,
  startDate,
  courseId,
  groupId,
}: ExcelRepositoryExportPayload): Promise<ExcelRepositoryExportResponse> {
  try {
    const tickets = await prisma.ticket.findMany({
      where: {
        ...(endDate ? { endDate: { lte: endDate } } : {}),
        status: StatusEnum.APPROVED,
        ...(startDate ? { startDate: { gte: startDate } } : {}),
        user: {
          ...(groupId ? { groupId } : {}),
        },
      },
      include: {
        user: {
          include: {
            group: { include: { course: true } },
          },
        },
        prooves: true,
      },
      orderBy: { startDate: "desc" },
    })

    if (tickets.length === 0) {
      throw new HttpError("Заявок удовлетворяющих критериям не найдено", 404)
    }

    return {
      tickets,
      total: tickets.length,
    }
  } catch (e) {
    if (e instanceof HttpError) {
      throw e
    }
    throw new HttpError("Ошибка базы данных", 500)
  }
}