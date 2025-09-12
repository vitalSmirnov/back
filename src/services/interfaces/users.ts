import { User, UserRole } from "@prisma/client"
import { Pagination } from "../../domain/dto/Pagination.js"
import { UserResponse } from "../../domain/dto/Users/UserResponse.js"

export interface GetUsersServicePayload extends Pagination {
  userName?: string
  course?: string
  group?: string
  role?: UserRole[]
}
export interface GetUsersServiceResponse {
  users: UserResponse[]
  total: number
}

export interface GetUserNamesServicePayload {
  name?: string
}
export interface GetUserNamesServiceResponse {
  users: Pick<User, "id" | "name">[]
  total: number
}

export interface GetConcreteUserServicePayload {
  userId: string
}
export interface GetConcreteUserServiceResponse extends UserResponse {}

export interface DeleteUserServicePayload {
  userId: string
}
export interface DeleteUserServiceResponse {
  message: string
}

export interface GrantRoleServicePayload {
  id: string
  role: UserRole
}
export interface GrantRoleServiceResponse extends UserResponse {}

export interface RejectRoleServicePayload {
  id: string
  role: UserRole
}
export interface RejectRoleServiceResponse extends UserResponse {}

export interface MeInfoServicePayload {
  id: string
}
export interface MeInfoServiceResponse extends UserResponse {}
