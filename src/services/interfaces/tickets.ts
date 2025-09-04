import { UserRole } from "@prisma/client"
import {
  ChangeTicketStatusPayload,
  ChangeTicketStatusResponse,
  CreateTicketInfoPayload,
  CreateTicketInfoResponse,
  GetTicketResponse,
  GetTicketsPayload,
  GetTicketsResponse,
  UpdateTicketInfoPayload,
  UpdateTicketInfoResponse,
} from "../../domain/dto/Tickets/Tickets.js"

export interface GetTicketListServicePayload extends GetTicketsPayload {
  roles: UserRole[]
  userId: string
}
export interface GetTicketListServiceResponse extends GetTicketsResponse {}

export interface GetTicketIdServicePayload {
  id: string
  userId: string
  roles: UserRole[]
}
export interface GetTicketIdServiceResponse extends GetTicketResponse {}

export interface CreateTicketServicePayload extends CreateTicketInfoPayload {
  userId: string
}
export interface CreateTicketServiceResponse extends CreateTicketInfoResponse {}

export interface UpdateTicketServicePayload extends UpdateTicketInfoPayload {
  userId: string
  roles: UserRole[]
  id: string
}
export interface UpdateTicketServiceResponse extends UpdateTicketInfoResponse {}

export interface ChangeStatusTicketServicePayload extends ChangeTicketStatusPayload {
  id: string
}
export interface ChangeStatusTicketServiceResponse extends ChangeTicketStatusResponse {}
