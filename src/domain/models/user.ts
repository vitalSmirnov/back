import { Group } from "./group.js"
import { Ticket } from "./ticket.js"
import { UserRole } from "./UserRoleEnum.js"

export interface User {
  id: string
  login: string
  name: string
  role: UserRole[]
  group: Omit<Group, "users"> | null
  tickets?: Ticket[]
}
