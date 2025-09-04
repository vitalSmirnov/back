import { Group } from "@prisma/client"

export interface GetGroupsServicePayload {
  identifier?: string
  courseId?: string
  limit?: string
  offset?: string
}
export interface GetGroupsServiceResponse {
  groups: Omit<Group, "users" | "course">[]
  total: number
}
