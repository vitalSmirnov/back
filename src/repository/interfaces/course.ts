import { Course } from "@prisma/client"

export interface GetCourseRepositoryPayload {
  group?: string
  limit?: string
  offset?: string
}
export interface GetCourseRepositoryResponse {
  courses: Omit<Course, "users" | "groups" | "name">[]
  total: number
}
