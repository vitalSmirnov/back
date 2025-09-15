import express, { type Request, type Response } from "express"
import { ErrorResponse } from "../domain/dto/ErrorResponse"
import { GetGroupsPayload, GetGroupsResponse } from "./interfaces/group"
import { getGroupsService } from "../services/groupService"
import { HttpError } from "../lib/error/Error"

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
