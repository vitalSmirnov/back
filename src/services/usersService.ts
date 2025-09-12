import { ReasonEnum } from "../domain/models/ReasonEnum.js"
import { StatusEnum } from "../domain/models/StatusEnum.js"
import { HttpError } from "../lib/error/Error.js"
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
import {
  getUsersRepository,
  getUserByNameRepository,
  getUserRepository,
  deleteUserRepository,
  grantRoleRepository,
  rejectRoleRepository,
  meInfoRepository,
} from "../repository/usersRepository.js"

export async function getUsersService({
  userName,
  role,
  course,
  group,
  offset = "0",
  limit = "100",
}: GetUsersServicePayload): Promise<GetUsersServiceResponse> {
  const { users } = await getUsersRepository({
    userName,
    role,
    course,
    group,
    offset,
    limit,
  })

  return {
    users: users.map(user => ({
      id: user.id,
      login: user.login,
      name: user.name,
      role: user.role,
      group: user.group,
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

export async function getUsersNameService({ name }: GetUserNamesServicePayload): Promise<GetUserNamesServiceResponse> {
  const { users } = await getUserByNameRepository({ name })

  return {
    users,
    total: users.length,
  }
}

export async function getConcreteUserService({
  userId,
}: GetConcreteUserServicePayload): Promise<GetConcreteUserServiceResponse> {
  const user = await getUserRepository({ id: userId })

  if (!user) throw new HttpError("пользователь не найден", 404)

  return {
    ...user,
    tickets: user.tickets!.map(ticket => ({
      ...ticket,
      reason: ticket.reason as ReasonEnum,
      status: ticket.status as StatusEnum,
      prooves: ticket.prooves,
    })),
  }
}

export async function deleteUserService({ userId }: DeleteUserServicePayload): Promise<DeleteUserServiceResponse> {
  const result = await deleteUserRepository({ userId })

  return result
}

export async function grantRoleService({ id, role }: GrantRoleServicePayload): Promise<GrantRoleServiceResponse> {
  const updatedUser = await grantRoleRepository({ id, role })

  return {
    ...updatedUser,
    tickets: updatedUser.tickets.map(ticket => ({
      ...ticket,
      reason: ticket.reason as ReasonEnum,
      status: ticket.status as StatusEnum,
    })),
  }
}

export async function rejectRoleService({ id, role }: RejectRoleServicePayload): Promise<RejectRoleServiceResponse> {
  const updatedUser = await rejectRoleRepository({ id, role })

  return {
    ...updatedUser,
    tickets: updatedUser.tickets.map(ticket => ({
      ...ticket,
      reason: ticket.reason as ReasonEnum,
      status: ticket.status as StatusEnum,
    })),
  }
}

export async function meInfoService({ id }: MeInfoServicePayload): Promise<MeInfoServiceResponse> {
  const user = await meInfoRepository({ id })

  return {
    ...user,
    tickets: user.tickets.map(ticket => ({
      ...ticket,
      reason: ticket.reason as ReasonEnum,
      status: ticket.status as StatusEnum,
    })),
  }
}
