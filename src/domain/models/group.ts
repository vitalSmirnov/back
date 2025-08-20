import { User } from "./user.js"

export interface Group {
  id: string
  identifier: string
  course: number
  users: User[]
}
