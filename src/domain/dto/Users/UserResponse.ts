import { User } from "@prisma/client"
import { Ticket } from "../../models/ticket.js"
import { UserRole } from "../../models/UserRoleEnum.js"
import { Pagination } from "../Pagination.js"
import { WithTotal } from "../WithTotalType.js"
import { Group } from "../../models/group.js"

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
  group: Omit<Group, "users"> | null
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
export interface UserChangeRoleResponse extends UserResponse {}

export interface UserSuggestPaload {}
export interface UserSuggestResponse {
  users: Pick<User, "id" | "name">[]
}
