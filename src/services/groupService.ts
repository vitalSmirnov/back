import prisma from "../prisma.js"
import { GetGroupsServicePayload, GetGroupsServiceResponse } from "./interfaces/group.js"

export async function getGroupsService({
  identifier,
  courseId,
  offset = "0",
  limit = "100",
}: GetGroupsServicePayload): Promise<GetGroupsServiceResponse> {
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
    groups: groups,
    total: groups.length,
  }
}
