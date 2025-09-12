import { ReasonEnum } from "../../models/ReasonEnum.js"
import { StatusEnum } from "../../models/StatusEnum.js"
import { Ticket } from "../../models/ticket.js"
import { User } from "../../models/user.js"
import { Pagination } from "../Pagination.js"
import { WithTotal } from "../WithTotalType.js"

interface TicketLessUser extends Ticket {
  user: Omit<User, "login">
}

export interface GetTicketsPayload extends Pagination {
  userName?: string
  startDate?: string
  endDate?: string
  group?: string
  reason?: ReasonEnum
  status?: StatusEnum
}
export interface GetTicketsResponse extends WithTotal {
  tickets: TicketLessUser[]
}
export interface GetTicketPayload {}
export interface GetTicketResponse extends TicketLessUser {}

export interface ChangeTicketStatusPayload {
  status: StatusEnum
}
export interface ChangeTicketStatusResponse {}

export interface UpdateTicketInfoPayload {
  endDate?: string
  name?: string
  reason?: ReasonEnum
  prooves?: string[]
  description: string
}
export interface UpdateTicketInfoResponse extends Ticket {}

export interface CreateTicketInfoPayload {
  endDate: string
  startDate: string
  name?: string
  reason?: ReasonEnum
  prooves: string[]
  description: string
}
export interface CreateTicketInfoResponse extends Ticket {}
