import { Ticket } from "../../models/ticket.js"
import { WithTotal } from "../WithTotalType.js"

export interface TicketResponse extends Ticket {}

export interface TicketListResponse extends WithTotal {
  tickets: TicketResponse[]
}
