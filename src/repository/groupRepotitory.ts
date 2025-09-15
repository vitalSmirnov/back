import { HttpError } from "../lib/error/Error"
import prisma from "../prisma"
import { GetGroupsRepositoryPayload, GetGroupsRepositoryResponse } from "./interfaces/group"

export async function getGroupsRepository({
  identifier,
  courseId,
  offset = "0",
  limit = "100",
}: GetGroupsRepositoryPayload): Promise<GetGroupsRepositoryResponse> {
  try {
    const groups = await prisma.group.findMany({
      where: { identifier: identifier, courseId: courseId },
      select: {
        id: true,
        identifier: true,
        courseId: true,
      },
      skip: parseInt(offset),
      take: parseInt(limit),
    })

    return {
      groups: groups ?? [],
      total: groups.length,
    }
  } catch (e) {
    throw new HttpError("Ошибка базы данных", 500)
  }
}
