import express, { type Request, type Response } from "express"
import { JwtAuth } from "../lib/utils/authHelpers"
import prisma from "../prisma"
import {
  ProoveCreateResponse,
  ProoveDeletePayload,
  ProoveDeleteResponse,
  ProoveUpdatePayload,
} from "../domain/dto/Prooves/index"
import { HttpError } from "../lib/error/Error"

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
      const errorMessage =
        error instanceof HttpError
          ? { message: error.message, status: error.statusCode }
          : { message: "Что-то пошло не так, попробуйте позже", status: 500 }
      console.error("Error logging out:", error)
      return res.status(errorMessage.status).json({ error: errorMessage.message })
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
