import { Group } from "./group.js"
import { User } from "./user.js"

export interface Course {
  id: string
  name: string
  identifier: number
  groups: Group[]
  users: User[]
}
