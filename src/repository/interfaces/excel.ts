import { TicketReason, TicketStatus } from "@prisma/client"
import { UserRole } from "../../domain/models/UserRoleEnum.js"
import { Prove } from "../../domain/models/prove.js"

export interface ExcelRepositoryExportPayload {
  endDate?: string
  startDate?: string
  courseId?: string
  groupId?: string
}

export interface ExcelRepositoryExportResponse {
  tickets: Array<{
    id: string
    name: string
    description: string
    startDate: Date
    endDate: Date
    reason: TicketReason
    status: TicketStatus
    userId: string
    user: {
      id: string
      name: string
      role: UserRole[]
      group: {
        id: string
        identifier: string
        course: {
          id: string
          identifier: number
          name: string
        }
      } | null
    }
    prooves: Prove[]
  }>
  total: number
}