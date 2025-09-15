import { Group } from "./group"
import { Ticket } from "./ticket"
import { UserRole } from "./UserRoleEnum"

export interface User {
  id: string
  login: string
  name: string
  role: UserRole[]
  group: Omit<Group, "users"> | null
  tickets?: Ticket[]
}
