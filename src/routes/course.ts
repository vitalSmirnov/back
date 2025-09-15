import express, { type Request, type Response } from "express"
import { GetCourseResponse, GetCoursesPayload } from "./interfaces/course"
import { getCoursesService } from "../services/courseService"
import { ErrorResponse } from "../domain/dto/ErrorResponse"
import { HttpError } from "../lib/error/Error"

const router = express.Router()

router.get(
  "/",
  async (req: Request<{}, {}, {}, GetCoursesPayload>, res: Response<GetCourseResponse | ErrorResponse>) => {
    try {
      const proove = await getCoursesService({
        identifier: req.query.identifier ? parseInt(req.query.identifier) : undefined,
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
