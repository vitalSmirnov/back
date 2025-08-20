import { Prove } from "../../models/prove.js"
import { ReasonEnum } from "../../models/ReasonEnum.js"
import { StatusEnum } from "../../models/StatusEnum.js"
import { Ticket } from "../../models/ticket.js"
import { Pagination } from "../Pagination.js"
import { WithTotal } from "../WithTotalType.js"

export interface GetTicketsPayload extends Pagination {
  userName?: string
  startDate?: Date
  endDate?: Date
  reason?: ReasonEnum
}
export interface GetTicketsResponse extends WithTotal {
  tickets: Ticket[]
}

export interface ChangeTicketStatusPayload {
  status: StatusEnum
}
export interface ChangeTicketStatusResponse {}

export interface UpdateTicketInfoPayload {
  endDate?: Date
  name?: string
  reason?: ReasonEnum
  prooves?: Prove[]
  description: string
}
export interface UpdateTicketInfoResponse extends Ticket {}

export interface CreateTicketInfoPayload {
  endDate: Date
  startDate: Date
  name?: string
  reason?: ReasonEnum
  prooves?: Prove[]
  description: string
}
export interface CreateTicketInfoResponse extends Ticket {}
