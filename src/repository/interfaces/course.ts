import { Course } from "@prisma/client"

export interface GetCourseRepositoryPayload {
  identifier?: number
  limit?: string
  offset?: string
}
export interface GetCourseRepositoryResponse {
  courses: Omit<Course, "users" | "groups" | "name">[]
  total: number
}
