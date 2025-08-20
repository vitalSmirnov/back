import express, { type Request, type Response } from "express"
import { isUser } from "../middlewares/authMiddleware.js"
import { JwtAuth } from "../lib/utils/authHelpers.js"
import { UserRoleEnum } from "../domain/models/UserRoleEnum.js"
import { deleteFile, getFilePath, fileExists } from "../lib/utils/fileUtils.js"
import prisma from "../prisma.js"

const router = express.Router()
router.use(JwtAuth)

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const proove = await prisma.prove.findUnique({
      where: { id: req.params.id },
      include: {
        ticket: true,
      },
    })

    if (!proove) return res.status(404).json({ error: "Not found" })

    return res.status(403).json({ error: "Forbidden" })
  } catch (error) {
    console.error("Error fetching proove:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
})

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const proove = await prisma.prove.findUnique({
      where: { id: req.params.id },
      include: {
        ticket: true,
      },
    })

    if (!proove) return res.status(404).json({ error: "Not found" })

    const updatedProove = await prisma.prove.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        ticket: true,
      },
    })
    return res.json(updatedProove)
  } catch (error) {
    console.error("Error updating proove:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
})

router.delete("/:id", isUser, async (req: Request, res: Response) => {
  try {
    const proove = await prisma.prove.findUnique({
      where: { id: req.params.id },
      include: {
        ticket: true,
      },
    })

    if (!proove) return res.status(404).json({ error: "Not found" })

    // Check if ticket belongs to user
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: proove.ticketId,
      },
    })

    if (!ticket) return res.status(403).json({ error: "Forbidden" })

    // Delete physical file
    const filePath = getFilePath(proove.path)
    if (fileExists(filePath)) {
      try {
        await deleteFile(filePath)
      } catch (fileError) {
        console.error("Error deleting physical file:", fileError)
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete from database
    await prisma.prove.delete({
      where: { id: req.params.id },
    })

    res.status(204).end()
  } catch (error) {
    console.error("Error deleting proove:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
})

export default router
