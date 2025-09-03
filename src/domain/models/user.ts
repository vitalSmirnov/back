import { Course } from "./course.js"
import { Group } from "./group.js"
import { Ticket } from "./ticket.js"
import { UserRole } from "./UserRoleEnum.js"

export interface User {
  id: string
  login: string
  name: string
  role: UserRole[]
  course: Omit<Course, "users" | "groups"> | null
  group: Omit<Group, "users" | "course"> | null
  tickets?: Ticket[]
}
