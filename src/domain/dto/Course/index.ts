import { Course } from "../../models/course"
import { Pagination } from "../Pagination"

interface CourseFilters {
  identifier?: string
}

export interface CoursePayload extends Pagination, CourseFilters {}
export interface CourseResponse extends Omit<Course, "users" | "groups" | "name"> {}
