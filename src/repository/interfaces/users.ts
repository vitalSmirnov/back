import { Pagination } from "../../domain/dto/Pagination.js"
import { User } from "../../domain/models/user.js"
import { UserRoleEnum } from "../../domain/models/UserRoleEnum.js"
import { ReasonEnum } from "../../domain/models/ReasonEnum.js"
import { StatusEnum } from "../../domain/models/StatusEnum.js"
import { UserRole, TicketReason, TicketStatus } from "@prisma/client"

export interface UsersNameRepositoryPayload extends Pagination {
  name?: string
}
export interface UsersNameRepositoryResponse {
  users: Pick<User, "id" | "name">[]
  total: number
}

export interface UsersListRepositoryPayload extends Pagination {
  name?: string
  course?: string
  group?: string
}
export interface UsersListRepositoryResponse {
  users: User[]
  total: number
}

export interface UserRepositoryPayload {
  id?: string
  login?: string
}
export interface UserRepositoryResponse extends User {}

export interface CreateUserRepositoryPayload {
  login: string
  name: string
  password: string
  group?: string
}
export interface CreateUserRepositoryResponse extends Pick<User, "id" | "role"> {}

// Additional interfaces for new repository functions
export interface GetUsersRepositoryPayload {
  userName?: string
  role?: UserRole[]
  course?: string
  group?: string
  offset?: string
  limit?: string
}

export interface GetUsersRepositoryResponse {
  users: Array<{
    id: string
    login: string
    name: string
    role: UserRole[]
    group: {
      id: string
      identifier: string
      course: {
        id: string
        identifier: number
        name: string
      }
    } | null
    tickets: Array<{
      id: string
      name: string
      description: string
      startDate: Date
      endDate: Date
      reason: TicketReason
      status: TicketStatus
      userId: string
      prooves: Array<{
        id: string
        name: string
        path: string
      }>
    }>
  }>
  total: number
}

export interface DeleteUserRepositoryPayload {
  userId: string
}

export interface DeleteUserRepositoryResponse {
  message: string
}

export interface GrantRoleRepositoryPayload {
  id: string
  role: UserRole
}

export interface GrantRoleRepositoryResponse {
  id: string
  login: string
  name: string
  role: UserRole[]
  group: {
    id: string
    identifier: string
    course: {
      id: string
      identifier: number
      name: string
    }
  } | null
  tickets: Array<{
    id: string
    name: string
    description: string
    startDate: Date
    endDate: Date
      reason: TicketReason
      status: TicketStatus
    userId: string
    prooves: Array<{
      id: string
      name: string
      path: string
    }>
  }>
}

export interface RejectRoleRepositoryPayload {
  id: string
  role: UserRole
}

export interface RejectRoleRepositoryResponse {
  id: string
  login: string
  name: string
  role: UserRole[]
  group: {
    id: string
    identifier: string
    course: {
      id: string
      identifier: number
      name: string
    }
  } | null
  tickets: Array<{
    id: string
    name: string
    description: string
    startDate: Date
    endDate: Date
      reason: TicketReason
      status: TicketStatus
    userId: string
    prooves: Array<{
      id: string
      name: string
      path: string
    }>
  }>
}

export interface MeInfoRepositoryPayload {
  id: string
}

export interface MeInfoRepositoryResponse {
  id: string
  login: string
  name: string
  role: UserRole[]
  group: {
    id: string
    identifier: string
    course: {
      id: string
      identifier: number
      name: string
    }
  } | null
  tickets: Array<{
    id: string
    name: string
    description: string
    startDate: Date
    endDate: Date
      reason: TicketReason
      status: TicketStatus
    userId: string
    prooves: Array<{
      id: string
      name: string
      path: string
    }>
  }>
}
