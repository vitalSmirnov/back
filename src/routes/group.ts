import express, { type Request, type Response } from "express"
import { ErrorResponse } from "../domain/dto/ErrorResponse.js"
import { GetGroupsPayload, GetGroupsResponse } from "./interfaces/group.js"
import { getGroupsService } from "../services/groupService.js"
import { HttpError } from "../lib/error/Error.js"

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
      const errorMessage =
        error instanceof HttpError
          ? { message: error.message, status: error.statusCode }
          : { message: "Что-то пошло не так, попробуйте позже", status: 500 }
      console.error("Error logging out:", error)
      return res.status(errorMessage.status).json({ error: errorMessage.message })
    }
  }
)

export default router
