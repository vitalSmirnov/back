import { UserRole } from "@prisma/client"
import { HttpError } from "../lib/error/Error"
import prisma from "../prisma"
import {
  CreateUserRepositoryPayload,
  CreateUserRepositoryResponse,
  UserRepositoryPayload,
  UserRepositoryResponse,
  UsersListRepositoryPayload,
  UsersListRepositoryResponse,
  UsersNameRepositoryPayload,
  UsersNameRepositoryResponse,
  GetUsersRepositoryPayload,
  GetUsersRepositoryResponse,
  DeleteUserRepositoryPayload,
  DeleteUserRepositoryResponse,
  GrantRoleRepositoryPayload,
  GrantRoleRepositoryResponse,
  RejectRoleRepositoryPayload,
  RejectRoleRepositoryResponse,
  MeInfoRepositoryPayload,
  MeInfoRepositoryResponse,
} from "./interfaces/users"
import { ReasonEnum } from "../domain/models/ReasonEnum"
import { StatusEnum } from "../domain/models/StatusEnum"

export async function getUsersNameRepository({
  name,
  offset = "0",
  limit = "100",
}: UsersNameRepositoryPayload): Promise<UsersNameRepositoryResponse> {
  try {
    const users = await prisma.user.findMany({
      where: { name },
      select: {
        id: true,
        name: true,
      },
      skip: parseInt(offset),
      take: parseInt(limit),
    })

    return {
      users: users,
      total: users.length,
    }
  } catch (e) {
    throw new HttpError("Ошибка базы данных", 500)
  }
}

export async function getUsersListRepository({
  name,
  offset = "0",
  limit = "100",
  course,
  group,
}: UsersListRepositoryPayload): Promise<UsersListRepositoryResponse> {
  try {
    const users = await prisma.user.findMany({
      where: { name, group: { identifier: group, course: { id: course } } },
      include: {
        tickets: {
          include: {
            prooves: true,
          },
        },
        group: {
          include: {
            course: {
              select: { id: true, identifier: true, name: true },
            },
          },
        },
      },
      skip: parseInt(offset),
      take: parseInt(limit),
    })

    return {
      users: users.map(user => ({
        ...user,
        tickets: user.tickets.map(ticket => ({
          ...ticket,
          reason: ticket.reason as ReasonEnum,
          status: ticket.status as StatusEnum,
        })),
      })),
      total: users.length,
    }
  } catch (e) {
    throw new HttpError("Ошибка базы данных", 500)
  }
}

export async function getUserRepository({ id, login }: UserRepositoryPayload): Promise<UserRepositoryResponse | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id, login },
      include: {
        tickets: {
          include: {
            prooves: true,
          },
        },
        group: {
          include: {
            course: {
              select: { id: true, identifier: true, name: true },
            },
          },
        },
      },
    })

    if (!user) return null

    return {
      ...user,
      tickets: user.tickets.map(ticket => ({
        ...ticket,
        reason: ticket.reason as ReasonEnum,
        status: ticket.status as StatusEnum,
      })),
    }
  } catch (e) {
    throw new HttpError("Ошибка базы данных", 500)
  }
}

export async function createUserRepotitory({
  login,
  name,
  password,
  group,
}: CreateUserRepositoryPayload): Promise<CreateUserRepositoryResponse> {
  try {
    const user = await prisma.user.create({
      data: {
        login,
        name,
        password,
        role: [UserRole.STUDENT],
        group: { connect: { id: group } },
      },
      select: {
        id: true,
        login: false,
        name: false,
        role: true,
        password: false,
      },
    })

    return user
  } catch (e) {
    throw new HttpError("Ошибка базы данных", 500)
  }
}

export async function getUsersRepository({
  userName,
  role,
  course,
  group,
  offset = "0",
  limit = "100",
}: GetUsersRepositoryPayload): Promise<GetUsersRepositoryResponse> {
  try {
    const roleFilter: { hasSome: UserRole[] } | undefined = role
      ? { hasSome: Array.isArray(role) ? role : [role] }
      : undefined

    const users = await prisma.user.findMany({
      where: {
        name: { contains: userName },
        role: roleFilter,
        group: {
          id: {
            contains: group ?? "",
            mode: "insensitive",
          },
          course: {
            id: {
              contains: course ?? "",
              mode: "insensitive",
            },
          },
        },
      },
      include: {
        group: {
          include: { course: true },
        },
        tickets: {
          include: { prooves: true },
        },
      },
      skip: parseInt(offset),
      take: parseInt(limit),
    })

    return {
      users,
      total: users.length,
    }
  } catch (e) {
    throw new HttpError("Ошибка базы данных", 500)
  }
}

export async function getUserByNameRepository({ name }: { name?: string }): Promise<UsersNameRepositoryResponse> {
  try {
    const userNames = await prisma.user.findMany({
      where: {
        name: { contains: name, mode: "insensitive" },
      },
      select: {
        id: true,
        name: true,
      },
    })

    return {
      users: userNames,
      total: userNames.length,
    }
  } catch (e) {
    throw new HttpError("Ошибка базы данных", 500)
  }
}

export async function deleteUserRepository({
  userId,
}: DeleteUserRepositoryPayload): Promise<DeleteUserRepositoryResponse> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) throw new HttpError("Пользователь не найден", 404)

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
      prisma.ticket.delete({
        where: { id: ticket.id },
      })
    )
    const deleteUser = prisma.user.delete({
      where: { id: userId },
    })

    await prisma.$transaction([...deleteProoves, ...deleteTickets, deleteUser])

    return {
      message: `Пользователь ${user.name} успешно удален`,
    }
  } catch (error) {
    throw new HttpError("Не удалось удалить пользователя, у него есть связанные заявки", 409)
  }
}

export async function grantRoleRepository({
  id,
  role,
}: GrantRoleRepositoryPayload): Promise<GrantRoleRepositoryResponse> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) throw new HttpError("пользователь не найден", 404)
    if (user.role.includes(role)) throw new HttpError("Роль уже назначена", 409)

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: [...user.role, role] },
      include: {
        group: {
          include: { course: { select: { id: true, identifier: true, name: true } } },
        },
        tickets: { include: { prooves: true } },
      },
    })

    return updatedUser
  } catch (e) {
    if (e instanceof HttpError) {
      throw e
    }
    throw new HttpError("Ошибка базы данных", 500)
  }
}

export async function rejectRoleRepository({
  id,
  role,
}: RejectRoleRepositoryPayload): Promise<RejectRoleRepositoryResponse> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) throw new HttpError("пользователь не найден", 404)
    if (!user.role.includes(role)) throw new HttpError("Роль не найдена", 409)

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: [...user.role.filter(i => i !== role)] },
      include: {
        group: {
          include: { course: { select: { id: true, identifier: true, name: true } } },
        },
        tickets: { include: { prooves: true } },
      },
    })

    return updatedUser
  } catch (e) {
    if (e instanceof HttpError) {
      throw e
    }
    throw new HttpError("Ошибка базы данных", 500)
  }
}

export async function meInfoRepository({ id }: MeInfoRepositoryPayload): Promise<MeInfoRepositoryResponse> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        login: true,
        name: true,
        role: true,
        group: {
          include: { course: { select: { id: true, identifier: true, name: true } } },
        },
        tickets: {
          include: {
            prooves: true,
          },
        },
      },
    })

    if (!user) throw new HttpError("Пользователь не найден", 404)

    return user
  } catch (e) {
    if (e instanceof HttpError) {
      throw e
    }
    throw new HttpError("Ошибка базы данных", 500)
  }
}
