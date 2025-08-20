import { Group } from "../../models/group.js"
import { Pagination } from "../Pagination.js"

interface GroupFilters {
  identifier?: string
  courseId?: string
}

export interface GroupsPayload extends GroupFilters, Pagination {}
export interface GroupsResponse extends Omit<Group, "users" | "course"> {}
