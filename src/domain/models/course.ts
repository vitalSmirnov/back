import { Group } from "./group"
import { User } from "./user"

export interface Course {
  id: string
  name: string
  identifier: number
  groups: Group[]
  users: User[]
}
