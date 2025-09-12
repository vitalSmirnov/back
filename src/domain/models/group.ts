import { Course } from "./course.js"
import { User } from "./user.js"

export interface Group {
  id: string
  identifier: string
  course: Omit<Course, "groups" | "users">
  users: User[]
}
