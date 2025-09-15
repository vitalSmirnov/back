import { Ticket } from "../../models/ticket"
import { WithTotal } from "../WithTotalType"

export interface TicketResponse extends Ticket {}

export interface TicketListResponse extends WithTotal {
  tickets: TicketResponse[]
}
