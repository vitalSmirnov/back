import { HttpError } from "../lib/error/Error"
import prisma from "../prisma"
import { GetCourseRepositoryPayload, GetCourseRepositoryResponse } from "./interfaces/course"

export async function getCoursesRepository({
  group,
  limit = "100",
  offset = "0",
}: GetCourseRepositoryPayload): Promise<GetCourseRepositoryResponse> {
  try {
    const courses = await prisma.course.findMany({
      where: {
        groups: {
          some: {
            identifier: group ? group : undefined,
          },
        },
      },
      select: {
        id: true,
        identifier: true,
        name: true,
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
