import { Group } from "../../models/group"
import { Pagination } from "../Pagination"

interface GroupFilters {
  identifier?: string
  courseId?: string
}

export interface GroupsPayload extends GroupFilters, Pagination {}
export interface GroupsResponse extends Omit<Group, "users" | "course"> {}
