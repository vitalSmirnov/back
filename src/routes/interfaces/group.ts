import { Group } from "@prisma/client"
import { Pagination } from "../../domain/dto/Pagination.js"

interface GroupFilters {
  identifier?: string
  courseId?: string
}

export interface GetGroupsPayload extends GroupFilters, Pagination {}
export interface GetGroupsResponse {
  groups: Omit<Group, "users" | "course">[]
  total: number
}
