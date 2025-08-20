import { Ticket } from "./ticket.js"
import { UserRole } from "./UserRoleEnum.js"

export interface User {
  id: string
  login: string
  name: string
  role: UserRole
  course: number
  group: string
  tickets?: Ticket[]
}
