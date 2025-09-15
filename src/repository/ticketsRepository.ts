import { TicketReason, TicketStatus } from "@prisma/client"
import { HttpError } from "../lib/error/Error"
import prisma from "../prisma"
import {
  CreateTicketRepositoryPayload,
  CreateTicketRepositoryResponse,
  GetTicketByIdRepositoryPayload,
  GetTicketByIdRepositoryResponse,
  GetTicketsByUserRepositoryPayload,
  GetTicketsByUserRepositoryResponse,
  GetTicketsByAdminRepositoryPayload,
  GetTicketsByAdminRepositoryResponse,
  UpdateTicketRepositoryPayload,
  UpdateTicketRepositoryResponse,
  ChangeStatusTicketRepositoryPayload,
  ChangeStatusTicketRepositoryResponse,
} from "./interfaces/tickets"
import { ReasonEnum } from "../domain/models/ReasonEnum"
import { StatusEnum } from "../domain/models/StatusEnum"

export async function createTicketRepository({
  name,
  description,
  startDate,
  endDate,
  reason,
  userId,
  prooves,
}: CreateTicketRepositoryPayload): Promise<CreateTicketRepositoryResponse> {
  try {
    const ticket = await prisma.ticket.create({
      data: {
        name: name || "Sick Day",
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason: reason || TicketReason.SICKDAY,
        status: TicketStatus.PENDING,
        userId,
        prooves: {
          createMany: {
            data: prooves
              ? prooves.map((item: string, index: number) => ({
                  name: `Prove for ticket - ${index + 1}`,
                  path: item,
                }))
              : [],
          },
        },
      },
      include: {
        user: {
          include: {
            group: { include: { course: true } },
          },
        },
        prooves: {
          select: { id: true, name: true, path: true },
        },
      },
    })

    return ticket
  } catch (e) {
    throw new HttpError("Ошибка базы данных", 500)
  }
}

export async function getTicketByIdRepository({
  id,
}: GetTicketByIdRepositoryPayload): Promise<GetTicketByIdRepositoryResponse | null> {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: {
        userId: true,
        id: true,
        name: true,
        description: true,
        startDate: true,
        endDate: true,
        reason: true,
        status: true,
        user: {
          include: {
            group: { include: { course: true } },
          },
        },
        prooves: {
          select: { id: true, name: true, path: true },
        },
      },
    })

    return ticket
  } catch (e) {
    throw new HttpError("Ошибка базы данных", 500)
  }
}

export async function getTicketsByUserRepository({
  userId,
}: GetTicketsByUserRepositoryPayload): Promise<GetTicketsByUserRepositoryResponse> {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { userId },
      include: {
        user: {
          include: {
            group: { include: { course: true } },
          },
        },
        prooves: {
          select: { id: true, name: true, path: true },
        },
      },
    })

    return {
      tickets: tickets.map(ticket => ({
        ...ticket,
        reason: ticket.reason as ReasonEnum,
        status: ticket.status as StatusEnum,
        prooves: ticket.prooves,
      })),
      total: tickets.length,
    }
  } catch (e) {
    throw new HttpError("Ошибка базы данных", 500)
  }
}

export async function getTicketsByAdminRepository({
  userName,
  reason,
  group,
  startDate,
  status,
  endDate,
  offset,
  limit,
}: GetTicketsByAdminRepositoryPayload): Promise<GetTicketsByAdminRepositoryResponse> {
  try {
    const tickets = await prisma.ticket.findMany({
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
            login: true,
            group: { include: { course: true } },
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

    return {
      tickets: tickets.map(ticket => ({
        ...ticket,
        reason: ticket.reason as ReasonEnum,
        status: ticket.status as StatusEnum,
      })),
      total: tickets.length,
    }
  } catch (e) {
    throw new HttpError("Ошибка базы данных", 500)
  }
}

export async function updateTicketRepository({
  id,
  name,
  description,
  reason,
  endDate,
  prooves,
}: UpdateTicketRepositoryPayload): Promise<UpdateTicketRepositoryResponse> {
  try {
    const updateData: {
      name?: string
      description?: string
      reason?: TicketReason
      endDate?: string
    } = {
      name: name,
      description,
      reason,
      endDate,
    }

    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData]
      }
    })

    const proovesUpdate =
      Array.isArray(prooves) && prooves.length > 0
        ? {
            deleteMany: {},
            createMany: {
              data: prooves.map((item: string, index: number) => ({
                name: `Prove for ticket ${id} - ${index + 1}`,
                path: item,
              })),
            },
          }
        : Array.isArray(prooves) && prooves.length === 0
        ? {
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
        user: {
          include: {
            group: { include: { course: true } },
          },
        },
        prooves: {
          select: { id: true, name: true, path: true },
        },
      },
    })

    return updatedTicket
  } catch (e) {
    throw new HttpError("Ошибка базы данных", 500)
  }
}

export async function changeStatusTicketRepository({
  status,
  id,
}: ChangeStatusTicketRepositoryPayload): Promise<ChangeStatusTicketRepositoryResponse> {
  try {
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: { status },
      include: {
        user: {
          include: {
            group: { include: { course: true } },
          },
        },
        prooves: {
          select: { id: true, name: true, path: true },
        },
      },
    })

    return updatedTicket
  } catch (e) {
    throw new HttpError("Ошибка базы данных", 500)
  }
}

export async function findTicketByIdRepository({ id }: { id: string }) {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            password: false,
            id: true,
            name: true,
            login: true,
            role: true,
            group: {
              include: { course: { select: { id: true, identifier: true, name: true } } },
            },
          },
        },
        prooves: true,
      },
    })

    return ticket
  } catch (e) {
    throw new HttpError("Ошибка базы данных", 500)
  }
}

export async function findTicketWithStatusRepository({ id, status }: { id: string; status: TicketStatus }) {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id, NOT: { status: status } },
    })

    return ticket
  } catch (e) {
    throw new HttpError("Ошибка базы данных", 500)
  }
}
