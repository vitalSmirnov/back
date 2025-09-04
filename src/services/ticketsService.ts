import { GetTicketsPayload } from "../domain/dto/Tickets/Tickets.js"
import { ReasonEnum } from "../domain/models/ReasonEnum.js"
import { StatusEnum } from "../domain/models/StatusEnum.js"
import { UserRoleEnum } from "../domain/models/UserRoleEnum.js"
import prisma from "../prisma.js"
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

async function createTicketsInDb({
  name,
  description,
  startDate,
  endDate,
  reason,
  userId,
  prooves,
}: CreateTicketServicePayload) {
  return await prisma.ticket.create({
    data: {
      name: name || "Sick Day",
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason: reason || ReasonEnum.SICKDAY,
      status: StatusEnum.PENDING,
      userId,
      prooves: {
        createMany: {
          data: prooves
            ? prooves.map((item: any, index: number) => ({
                name: `Prove for ticket - ${index + 1}`,
                path: item,
              }))
            : [],
        },
      },
    },
    include: {
      user: true,
      prooves: {
        select: { id: true, name: true, path: true },
      },
    },
  })
}

async function getTicketIdFromDb(id: string) {
  return await prisma.ticket.findUnique({
    where: { id },
    select: {
      userId: false,
      id: true,
      name: true,
      description: true,
      startDate: true,
      endDate: true,
      reason: true,
      status: true,
      user: {
        include: {
          course: { select: { id: true, identifier: true, name: true } },
          group: { select: { id: true, identifier: true } },
        },
      },
      prooves: {
        select: { id: true, name: true, path: true },
      },
    },
  })
}

async function getTicketsFromUser(userId: string) {
  return await prisma.ticket.findMany({
    where: { userId },
    include: {
      user: {
        include: {
          course: { select: { id: true, identifier: true, name: true } },
          group: { select: { id: true, identifier: true } },
        },
      },
      prooves: {
        select: { id: true, name: true, path: true },
      },
    },
  })
}
async function getTicketsFromAdmin({
  userName,
  reason,
  group,
  startDate,
  status,
  endDate,
  offset,
  limit,
}: GetTicketsPayload) {
  return await prisma.ticket.findMany({
    where: {
      user: {
        name: {
          contains: userName,
          mode: "insensitive",
        },
        group: { id: group },
      },
      reason: reason,
      status: status,
      endDate: endDate ? { lte: new Date(endDate) } : undefined,
      startDate: { gte: startDate ? new Date(startDate) : undefined },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          role: true,
          course: { select: { id: true, identifier: true, name: true } }, // added id
          group: { select: { id: true, identifier: true } }, // added id
        },
      },
      prooves: {
        select: { id: true, name: true, path: true },
      },
    },

    orderBy: {
      startDate: "desc",
    },
    skip: offset ? parseInt(offset) : 0,
    take: limit ? parseInt(limit) : 100,
  })
}

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
  let tickets = []
  if (roles.includes(UserRoleEnum.PROFESSOR) || roles.includes(UserRoleEnum.ADMIN)) {
    tickets = await getTicketsFromAdmin({ reason, userName, group, startDate, status, endDate, offset, limit })
  } else {
    tickets = await getTicketsFromUser(userId)
  }

  return {
    tickets: tickets.map(ticket => ({
      ...ticket,
      reason: ticket.reason as ReasonEnum,
      status: ticket.status as StatusEnum,
    })),
    total: tickets.length,
  }
}
export async function getTicketIdService({
  roles,
  id,
  userId,
}: GetTicketIdServicePayload): Promise<GetTicketIdServiceResponse> {
  const ticket = await getTicketIdFromDb(id)

  if (!ticket) throw new HttpError("Заявка не найдена", 404)

  if (!roles.includes(UserRoleEnum.ADMIN) && ticket.user.id !== userId) throw new HttpError("Доступ запрещен", 403)

  return {
    ...ticket,
    reason: ticket.reason as ReasonEnum,
    status: ticket.status as StatusEnum,
  }
}

export async function createTicketService(payload: CreateTicketServicePayload): Promise<CreateTicketServiceResponse> {
  const ticket = await createTicketsInDb(payload)
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
  const ticket = await prisma.ticket.findUnique({
    where: { id },
  })

  if (!ticket) throw new HttpError("Заявка не найдена", 404)
  if (ticket.status !== StatusEnum.PENDING) throw new HttpError("В этом состоянии редактирование недоступно", 409)

  if (!roles.includes(UserRoleEnum.ADMIN) && ticket.userId !== userId)
    throw new HttpError("Отсутствуют права для редактирования заявки", 403)

  const updateData: any = {
    name: name,
    description,
    reason,
    endDate,
  }

  Object.keys(updateData).forEach(key => {
    if (updateData[key] === undefined) delete updateData[key]
  })

  const proovesUpdate =
    Array.isArray(prooves) && prooves.length > 0
      ? {
          deleteMany: {},
          createMany: {
            data: prooves.map((item: any, index: number) => ({
              name: `Prove for ticket ${id} - ${index + 1}`,
              path: item,
            })),
          },
        }
      : Array.isArray(prooves) && prooves.length === 0
      ? {
          // empty array provided -> remove all existing prooves
          deleteMany: {},
        }
      : undefined

  const updatedTicket = await prisma.ticket.update({
    where: { id },
    data: {
      ...updateData,
      prooves: proovesUpdate,
    },
    include: {
      user: true,
      prooves: {
        select: { id: true, name: true, path: true },
      },
    },
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
  const ticket = await prisma.ticket.findUnique({
    where: { id, NOT: { status: status } },
  })

  if (!ticket) throw new HttpError("Заявка не найдена", 404)

  const updatedTicket = await prisma.ticket.update({
    where: { id },
    data: { status },
    include: {
      user: true,
      prooves: true,
    },
  })

  return updatedTicket
}
