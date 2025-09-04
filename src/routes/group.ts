import express, { type Request, type Response } from "express"
import { ErrorResponse } from "../domain/dto/ErrorResponse.js"
import { GetGroupsPayload, GetGroupsResponse } from "./interfaces/group.js"
import { getGroupsService } from "../services/groupService.js"

const router = express.Router()

router.get(
  "/",
  async (req: Request<{}, {}, {}, GetGroupsPayload>, res: Response<GetGroupsResponse | ErrorResponse>) => {
    try {
      const proove = await getGroupsService({
        identifier: req.query.identifier,
        courseId: req.query.courseId,
        limit: req.query.limit,
        offset: req.query.offset,
      })

      return res.status(200).json(proove)
    } catch (error) {
      console.error("Error fetching proove:", error)
      return res.status(500).json({ error: error instanceof Error ? error.message : "Internal server error" })
    }
  }
)

export default router
