import { Course } from "../../models/course.js"
import { Pagination } from "../Pagination.js"

interface CourseFilters {
  identifier?: string
}

export interface CoursePayload extends Pagination, CourseFilters {}
export interface CourseResponse extends Omit<Course, "users" | "groups" | "name"> {}
