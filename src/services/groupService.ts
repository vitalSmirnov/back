import { getGroupsRepository } from "../repository/groupRepotitory.js"
import { GetGroupsServicePayload, GetGroupsServiceResponse } from "./interfaces/group.js"

export async function getGroupsService({
  identifier,
  courseId,
  offset = "0",
  limit = "100",
}: GetGroupsServicePayload): Promise<GetGroupsServiceResponse> {
  const groups = await getGroupsRepository({ identifier, courseId, limit, offset })

  return groups
}
