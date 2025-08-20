import express, { type Request, type Response } from "express"
import { GroupsPayload, GroupsResponse } from "../domain/dto/Group/index.js"
import prisma from "../prisma.js"

const router = express.Router()

router.get(
  "/",
  async (req: Request<{}, {}, {}, GroupsPayload>, res: Response<GroupsResponse[] | { error: string }>) => {
    try {
      const proove = await prisma.group.findMany({
        where: { identifier: req.query.identifier ? req.query.identifier : undefined , courseId: req.query.courseId },
        select: {
          id: true,
          identifier: true,
        },

        skip: parseInt(req.query.offset || '0'),
      take: parseInt(req.query.limit || '100'),
      })

      return res.status(200).json(proove)
    } catch (error) {
      console.error("Error fetching proove:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }
)

export default router
