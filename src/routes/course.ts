import express, { type Request, type Response } from "express"
import { GetCourseResponse, GetCoursesPayload } from "./interfaces/course.js"
import { getCoursesService } from "../services/courseService.js"
import { ErrorResponse } from "../domain/dto/ErrorResponse.js"

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
      const errorMessage = (error as Error).message || "Internal server error"
      console.error("Error fetching proove:", error)
      return res.status(500).json({ error: errorMessage || "Internal server error" })
    }
  }
)

export default router
