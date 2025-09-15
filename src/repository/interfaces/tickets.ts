import { GetTicketsPayload } from "../../domain/dto/Tickets/Tickets"
import { TicketReason, TicketStatus } from "@prisma/client"
import { Prove } from "../../domain/models/prove"
import { UserRole } from "../../domain/models/UserRoleEnum"

// Detailed interfaces for ticket responses
export interface TicketUser {
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

export interface TicketWithUser {
  id: string
  name: string
  description: string
  startDate: Date
  endDate: Date
  reason: TicketReason
  status: TicketStatus
  user: TicketUser
  prooves: Prove[]
}

export interface CreateTicketRepositoryPayload {
  name?: string
  description: string
  startDate: string
  endDate: string
  reason?: TicketReason
  userId: string
  prooves?: string[]
}

export interface CreateTicketRepositoryResponse extends TicketWithUser {}

export interface GetTicketByIdRepositoryPayload {
  id: string
}

export interface GetTicketByIdRepositoryResponse extends TicketWithUser {}

export interface GetTicketsByUserRepositoryPayload {
  userId: string
}

export interface GetTicketsByUserRepositoryResponse {
  tickets: TicketWithUser[]
  total: number
}

export interface GetTicketsByAdminRepositoryPayload extends GetTicketsPayload {}

export interface GetTicketsByAdminRepositoryResponse {
  tickets: TicketWithUser[]
  total: number
}

export interface UpdateTicketRepositoryPayload {
  id: string
  name?: string
  description?: string
  reason?: TicketReason
  endDate?: string
  prooves?: string[]
}

export interface UpdateTicketRepositoryResponse extends TicketWithUser {}

export interface ChangeStatusTicketRepositoryPayload {
  id: string
  status: TicketStatus
}

export interface ChangeStatusTicketRepositoryResponse extends TicketWithUser {}
