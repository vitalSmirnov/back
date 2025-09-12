import { GetTicketsPayload } from "../domain/dto/Tickets/Tickets.js"
import { ReasonEnum } from "../domain/models/ReasonEnum.js"
import { StatusEnum } from "../domain/models/StatusEnum.js"
import { UserRoleEnum } from "../domain/models/UserRoleEnum.js"
import {
  ChangeStatusTicketServicePayload,
  ChangeStatusTicketServiceResponse,
  CreateTicketServicePayload,
  CreateTicketServiceResponse,
  GetTicketIdServicePayload,
  GetTicketIdServiceResponse,
  GetTicketListServicePayload,
  GetTicketListServiceResponse,
  UpdateTicketServicePayload,
  UpdateTicketServiceResponse,
} from "./interfaces/tickets.js"
import { HttpError } from "../lib/error/Error.js"
import {
  createTicketRepository,
  findTicketByIdRepository,
  getTicketsByAdminRepository,
  getTicketsByUserRepository,
  updateTicketRepository,
  changeStatusTicketRepository,
  findTicketWithStatusRepository,
} from "../repository/ticketsRepository.js"

export async function getTicketListService({
  roles,
  userName,
  group,
  reason,
  startDate,
  status,
  endDate,
  offset,
  limit,
  userId,
}: GetTicketListServicePayload): Promise<GetTicketListServiceResponse> {
  if (roles.includes(UserRoleEnum.PROFESSOR) || roles.includes(UserRoleEnum.ADMIN)) {
    const result = await getTicketsByAdminRepository({
      reason,
      userName,
      group,
      startDate,
      status,
      endDate,
      offset,
      limit,
    })
    return {
      ...result,
      tickets: result.tickets.map(ticket => ({
        ...ticket,
        reason: ticket.reason as ReasonEnum,
        status: ticket.status as StatusEnum,
      })),
    }
  } else {
    const result = await getTicketsByUserRepository({ userId })
    return {
      ...result,
      tickets: result.tickets.map(ticket => ({
        ...ticket,
        reason: ticket.reason as ReasonEnum,
        status: ticket.status as StatusEnum,
      })),
    }
  }
}
export async function getTicketIdService({
  roles,
  id,
  userId,
}: GetTicketIdServicePayload): Promise<GetTicketIdServiceResponse> {
  const ticket = await findTicketByIdRepository({ id })

  if (!ticket) throw new HttpError("Заявка не найдена", 404)

  if (!roles.includes(UserRoleEnum.ADMIN) && ticket.user.id !== userId) throw new HttpError("Доступ запрещен", 403)

  return {
    ...ticket,
    reason: ticket.reason as ReasonEnum,
    status: ticket.status as StatusEnum,
  }
}

export async function createTicketService(payload: CreateTicketServicePayload): Promise<CreateTicketServiceResponse> {
  const ticket = await createTicketRepository(payload)
  return {
    ...ticket,
    reason: ticket.reason as ReasonEnum,
    status: ticket.status as StatusEnum,
  }
}

export async function updateTicketService({
  id,
  roles,
  userId,
  name,
  description,
  reason,
  endDate,
  prooves,
}: UpdateTicketServicePayload): Promise<UpdateTicketServiceResponse> {
  const ticket = await findTicketByIdRepository({ id })

  if (!ticket) throw new HttpError("Заявка не найдена", 404)
  if (ticket.status !== StatusEnum.PENDING) throw new HttpError("В этом состоянии редактирование недоступно", 409)

  if (!roles.includes(UserRoleEnum.ADMIN) && ticket.userId !== userId)
    throw new HttpError("Отсутствуют права для редактирования заявки", 403)

  const updatedTicket = await updateTicketRepository({
    id,
    name,
    description,
    reason,
    endDate,
    prooves,
  })

  return {
    ...updatedTicket,
    status: updatedTicket.status as StatusEnum,
    reason: updatedTicket.reason as ReasonEnum,
  }
}

export async function changeStatusTicketService({
  status,
  id,
}: ChangeStatusTicketServicePayload): Promise<ChangeStatusTicketServiceResponse> {
  const ticket = await findTicketWithStatusRepository({ id, status })

  if (!ticket) throw new HttpError("Заявка не найдена", 404)

  const updatedTicket = await changeStatusTicketRepository({ id, status })

  return updatedTicket
}
