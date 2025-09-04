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
    throw new Error("Курс по данному идентификатору не найден")
  }

  return {
    courses: courses,
    total: courses.length,
  }
}
