import { Group } from "@prisma/client"

export interface GetGroupsRepositoryPayload {
  identifier?: string
  courseId?: string
  limit?: string
  offset?: string
}
export interface GetGroupsRepositoryResponse {
  groups: Omit<Group, "users" | "course">[]
  total: number
}
