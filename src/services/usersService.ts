import { ReasonEnum } from "../domain/models/ReasonEnum.js"
import { StatusEnum } from "../domain/models/StatusEnum.js"
import { HttpError } from "../lib/error/Error.js"
import prisma from "../prisma.js"
import { RejectRolePayload } from "../routes/interfaces/users.js"
import {
  DeleteUserServicePayload,
  DeleteUserServiceResponse,
  GetConcreteUserServicePayload,
  GetConcreteUserServiceResponse,
  GetUserNamesServicePayload,
  GetUserNamesServiceResponse,
  GetUsersServicePayload,
  GetUsersServiceResponse,
  GrantRoleServicePayload,
  GrantRoleServiceResponse,
  MeInfoServicePayload,
  MeInfoServiceResponse,
  RejectRoleServicePayload,
  RejectRoleServiceResponse,
} from "./interfaces/users.js"

export async function getUsersService({
  userName,
  role,
  course,
  group,
  offset = "0",
  limit = "100",
}: GetUsersServicePayload): Promise<GetUsersServiceResponse> {
  const roleFilter: any = role ? { hasSome: Array.isArray(role) ? role : [role] } : undefined

  const users = await prisma.user.findMany({
    where: {
      name: { contains: userName },
      role: roleFilter,
      course: {
        id: {
          contains: course,
          mode: "insensitive",
        },
      },
      group: {
        id: {
          contains: group,
          mode: "insensitive",
        },
      },
    },
    include: {
      course: true,
      group: true,
      tickets: {
        include: { prooves: true },
      },
    },
    skip: parseInt(offset),
    take: parseInt(limit),
  })

  return {
    users: users.map(user => ({
      id: user.id,
      login: user.login,
      name: user.name,
      role: user.role,
      course: user.course ?? undefined,
      group: user.group ?? undefined,
      tickets: user.tickets.map(ticket => ({
        ...ticket,
        reason: ticket.reason as ReasonEnum,
        status: ticket.status as StatusEnum,
        prooves: ticket.prooves,
      })),
    })),
    total: users.length,
  }
}

export async function getUsersNameService({}: GetUserNamesServicePayload): Promise<GetUserNamesServiceResponse> {
  const userNames = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
    },
  })

  return {
    users: userNames,
    total: userNames.length,
  }
}

export async function getConcreteUserService({
  userId,
}: GetConcreteUserServicePayload): Promise<GetConcreteUserServiceResponse> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      course: {
        select: { id: true, identifier: true, name: true },
      },
      group: {
        select: { id: true, identifier: true },
      },
      tickets: {
        include: {
          prooves: {
            select: { id: true, path: true, name: true },
          },
        },
      },
    },
  })

  if (!user) throw new HttpError("пользователь не найден", 404)

  return {
    id: user.id,
    login: user.login,
    name: user.name,
    role: user.role,
    course: user.course ?? undefined,
    group: user.group ?? undefined,
    tickets: user.tickets.map(ticket => ({
      ...ticket,
      reason: ticket.reason as ReasonEnum,
      status: ticket.status as StatusEnum,
      prooves: ticket.prooves,
    })),
  }
}

export async function deleteUserService({ userId }: DeleteUserServicePayload): Promise<DeleteUserServiceResponse> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) throw new HttpError("Пользователь не найден", 404)

  try {
    const result = await prisma.ticket.findMany({
      where: { userId },
      include: { prooves: true },
    })

    const deleteProoves = result.map(ticket =>
      prisma.prove.deleteMany({
        where: { ticketId: ticket.id },
      })
    )
    const deleteTickets = result.map(ticket =>
      // delete each ticket by id (returns a PrismaPromise for each)
      prisma.ticket.delete({
        where: { id: ticket.id },
      })
    )
    const deleteUser = prisma.user.delete({
      where: { id: userId },
    })
    // pass a flat array of PrismaPromises to $transaction
    await prisma.$transaction([...deleteProoves, ...deleteTickets, deleteUser])

    return {
      message: `Пользователь ${user.name} успешно удален`,
    }
  } catch (error) {
    throw new HttpError("Не удалось удалить пользователя, у него есть связанные заявки", 409)
  }
}

export async function grantRoleService({ id, role }: GrantRoleServicePayload): Promise<GrantRoleServiceResponse> {
  const user = await prisma.user.findUnique({
    where: { id },
  })

  if (!user) throw new HttpError("пользователь не найден", 404)
  if (user.role.includes(role)) throw new HttpError("Роль уже назначена", 409)

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { role: [...user.role, role] },
    include: { course: true, group: true },
  })

  return {
    ...updatedUser,
    course: updatedUser.course ?? undefined,
    group: updatedUser.group ?? undefined,
  }
}

export async function rejectRoleService({ id, role }: RejectRoleServicePayload): Promise<RejectRoleServiceResponse> {
  const user = await prisma.user.findUnique({
    where: { id },
  })

  if (!user) throw new HttpError("пользователь не найден", 404)
  if (!user.role.includes(role)) throw new HttpError("Роль не найдена", 409)

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { role: [...user.role.filter(i => i !== role)] },
    include: { course: true, group: true },
  })

  return {
    ...updatedUser,
    course: updatedUser.course ?? undefined,
    group: updatedUser.group ?? undefined,
  }
}

export async function meInfoService({ id }: MeInfoServicePayload): Promise<MeInfoServiceResponse> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      login: true,
      name: true,
      role: true,
      course: true,
      group: true,
      tickets: {
        include: {
          prooves: true,
        },
      },
    },
  })

  if (!user) throw new HttpError("Пользователь не найден", 404)

  return {
    ...user,
    course: user.course ?? undefined,
    group: user.group ?? undefined,
    tickets: user.tickets.map(ticket => ({
      ...ticket,
      reason: ticket.reason as ReasonEnum,
      status: ticket.status as StatusEnum,
    })),
  }
}
