import { Course } from "@prisma/client"

export interface GetCourseServicePayload {
  identifier?: number
  limit?: string
  offset?: string
}
export interface GetCourseServiceResponse {
  courses: Omit<Course, "users" | "groups" | "name">[]
  total: number
}
