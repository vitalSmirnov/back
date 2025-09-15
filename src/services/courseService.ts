import { getCoursesRepository } from "../repository/courseRepository"
import { GetCourseServicePayload, GetCourseServiceResponse } from "./interfaces/course"

export async function getCoursesService({
  identifier,
  limit = "100",
  offset = "0",
}: GetCourseServicePayload): Promise<GetCourseServiceResponse> {
  const courses = await getCoursesRepository({ identifier, limit, offset })

  return courses
}
