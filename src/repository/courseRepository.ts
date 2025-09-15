import { HttpError } from "../lib/error/Error"
import prisma from "../prisma"
import { GetCourseRepositoryPayload, GetCourseRepositoryResponse } from "./interfaces/course"

export async function getCoursesRepository({
  identifier,
  limit = "100",
  offset = "0",
}: GetCourseRepositoryPayload): Promise<GetCourseRepositoryResponse> {
  try {
    const courses = await prisma.course.findMany({
      where: { identifier: identifier },
      select: {
        id: true,
        identifier: true,
      },
      skip: parseInt(offset),
      take: parseInt(limit),
    })

    return {
      courses: courses,
      total: courses.length,
    }
  } catch (e) {
    throw new HttpError("Ошибка базы данных", 500)
  }
}
