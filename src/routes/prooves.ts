import express, { type Request, type Response } from "express"
import { JwtAuth } from "../lib/utils/authHelpers.js"
import prisma from "../prisma.js"
import {
  ProoveCreateResponse,
  ProoveDeletePayload,
  ProoveDeleteResponse,
  ProoveUpdatePayload,
} from "../domain/dto/Prooves/index.js"

const router = express.Router()
router.use(JwtAuth)

router.put(
  "/:id",
  async (req: Request<{ id: string }, {}, ProoveUpdatePayload>, res: Response<ProoveCreateResponse>) => {
    const { ticketId, path } = req.body
    const { id } = req.params
    try {
      const proove = await prisma.prove.update({
        where: { id },
        data: {
          name: `Подтверждение к ${ticketId}`,
          path: path,
        },
      })

      return res.status(200).json(proove)
    } catch (error) {
      console.error("Error fetching proove:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }
)

router.delete(
  "/:id",
  async (req: Request<{ id: string }, {}, ProoveDeletePayload>, res: Response<ProoveDeleteResponse>) => {
    const { id } = req.params
    try {
      const proove = await prisma.prove.delete({
        where: { id },
      })
      if (!proove) return res.status(404).json({ error: "Not found" })

      return res.status(204).end()
    } catch (error) {
      console.error("Error deleting proove:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }
)

export default router
