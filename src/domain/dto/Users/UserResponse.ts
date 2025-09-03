import { Ticket } from "../../models/ticket.js"
import { User } from "../../models/user.js"
import { UserRole } from "../../models/UserRoleEnum.js"
import { Pagination } from "../Pagination.js"
import { WithTotal } from "../WithTotalType.js"

export interface UserPayload {
  userName?: string
  course?: string
  group?: string
}
export interface UserResponse {
  id: string
  name: string
  role: UserRole[]
  login: string
  course?: number
  group?: string
  tickets: Ticket[]
}

export interface UserListPayload extends Pagination {
  userName?: string
  course?: string
  group?: string
  role?: UserRole[]
}
export interface UserListResponse extends WithTotal {
  users: UserResponse[]
}

export interface UserChangeRolePayload {
  role: UserRole
}
export interface UserChangeRoleResponse extends Omit<UserResponse, "tickets"> {}
