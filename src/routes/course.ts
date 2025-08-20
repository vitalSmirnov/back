import express, { type Request, type Response } from "express"
import { CoursePayload, CourseResponse } from "../domain/dto/Course/index.js"
import prisma from "../prisma.js"

const router = express.Router()

router.get("/", async (req: Request<{},{},{}, CoursePayload>, res: Response<CourseResponse[] | { error: string }>) => {
  try {
    const proove = await prisma.course.findMany({
      where: { identifier: req.query.identifier ? parseInt(req.query.identifier) : undefined },
      select: {
        id: true,
        identifier: true,
      },
      skip: parseInt(req.query.offset || '0'),
      take: parseInt(req.query.limit || '100'),
    })

    return res.status(200).json(proove || [])
  } catch (error) {
    console.error("Error fetching proove:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
})

export default router
