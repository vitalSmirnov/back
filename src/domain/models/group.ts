import { Course } from "./course"
import { User } from "./user"

export interface Group {
  id: string
  identifier: string
  course: Omit<Course, "groups" | "users">
  users: User[]
}
