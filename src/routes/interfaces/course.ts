import { Course } from "@prisma/client"
import { Pagination } from "../../domain/dto/Pagination.js"

interface CourseFilters {
  identifier?: string
}
export interface GetCoursesPayload extends Pagination, CourseFilters {}

export interface GetCourseResponse {
  courses: Omit<Course, "users" | "groups" | "name">[]
  total: number
}
