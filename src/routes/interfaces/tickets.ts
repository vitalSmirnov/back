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
} from "../../domain/dto/Tickets/Tickets"

export interface GetTicketListPayload extends GetTicketsPayload {}
export interface GetTicketListResponse extends GetTicketsResponse {}

export interface GetTicketIdPayload {}
export interface GetTicketIdResponse extends GetTicketResponse {}

export interface CreateTicketPayload extends CreateTicketInfoPayload {}
export interface CreateTicketResponse extends CreateTicketInfoResponse {}

export interface UpdateTicketPayload extends UpdateTicketInfoPayload {}
export interface UpdateTicketResponse extends UpdateTicketInfoResponse {}

export interface ChangeStatusTicketPayload extends ChangeTicketStatusPayload {}
export interface ChangeStatusTicketResponse extends ChangeTicketStatusResponse {}
