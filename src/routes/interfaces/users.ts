import { User, UserRole } from "@prisma/client"
import { Pagination } from "../../domain/dto/Pagination.js"
import { UserChangeRolePayload, UserChangeRoleResponse, UserResponse } from "../../domain/dto/Users/UserResponse.js"

export interface GetUsersPayload extends Pagination {
  userName?: string
  course?: string
  group?: string
  role?: UserRole[]
}
export interface GetUsersResponse {
  users: UserResponse[]
  total: number
}

export interface GetUsersNamesPayload extends Pagination {
  userName?: string
}
export interface GetUsersNamesResponse {
  users: Pick<User, "id" | "name">[]
  total: number
}

export interface GetConcreteUserPayload {
  userId: string
}
export interface GetConcreteUserResponse extends UserResponse {}

export interface DeleteUserPayload {
  userId: string
}
export interface DeleteUserResponse {
  message: string
}

export interface GrantRolePayload extends UserChangeRolePayload {}
export interface GrantRoleResponse extends UserChangeRoleResponse {}

export interface RejectRolePayload extends UserChangeRolePayload {}
export interface RejectRoleResponse extends UserChangeRoleResponse {}
