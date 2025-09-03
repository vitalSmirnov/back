import ExcelJS from "exceljs"
import { UserRoleEnum } from "../../domain/models/UserRoleEnum.js"
import { ReasonEnum } from "../../domain/models/ReasonEnum.js"
import { StatusEnum } from "../../domain/models/StatusEnum.js"

interface TableColumn {
  header: string
  key: string
  width: number
}

type TableRow = {
  id: string
  name: string
  description: string
  startDate: Date
  endDate: Date
  reason: ReasonEnum
  status: StatusEnum
  userId: string
} & {
  user: {
    course: {
      id: string
      name: string
      identifier: number
    } | null
    group: {
      id: string
      identifier: string
    } | null
  } & {
    id: string
    name: string
    login: string
    password: string
    courseId: string | null
    groupId: string | null
    role: UserRoleEnum
  }
  prooves: {
    id: string
    name: string
    path: string
    ticketId: string
  }[]
}

export async function createTable(columns: TableColumn[], tickets: TableRow[]) {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet("Tickets")

  sheet.columns = columns

  tickets.forEach(t =>
    sheet.addRow({
      name: t.name,
      userName: t.user.name,
      course: t.user.course?.identifier || "",
      group: t.user.group?.identifier || "",
      reason: t.reason,
      startDate: t.startDate.toISOString().split("T")[0],
      endDate: t.endDate.toISOString().split("T")[0],
      description: t.description || "",
    })
  )

  sheet.getRow(1).font = { bold: true }

  sheet.getRow(sheet.rowCount + 2).getCell(1).value = `Всего: ${tickets.length}`

  return workbook
}
