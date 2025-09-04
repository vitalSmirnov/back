import { HttpError } from "../lib/error/Error.js"
import prisma from "../prisma.js"
import { GetCourseServicePayload, GetCourseServiceResponse } from "./interfaces/course.js"

export async function getCoursesService({
  identifier,
  limit = "100",
  offset = "0",
}: GetCourseServicePayload): Promise<GetCourseServiceResponse> {
  const courses = await prisma.course.findMany({
    where: { identifier: identifier },
    select: {
      id: true,
      identifier: true,
    },
    skip: parseInt(offset),
    take: parseInt(limit),
  })

  if (!courses) {
    throw new HttpError("Курс по данному идентификатору не найден", 404)
  }

  return {
    courses: courses,
    total: courses.length,
  }
}
