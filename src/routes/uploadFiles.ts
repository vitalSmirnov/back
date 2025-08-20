import { uploadSingle, handleUploadError } from "../middlewares/uploadMiddleware.js"
import { getFileInfo } from "../lib/utils/fileUtils.js"
import { type Request, type Response } from "express"
import { isUser } from "../middlewares/authMiddleware.js"
import { JwtAuth } from "../lib/utils/authHelpers.js"
import express from "express"
import prisma from "../prisma.js"

const router = express.Router()
router.use(JwtAuth)

router.post("/upload", isUser, uploadSingle, handleUploadError, async (req: Request, res: Response) => {
  try {
    const { ticketId, name } = req.body

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    if (!ticketId) {
      return res.status(400).json({ error: "Ticket ID is required" })
    }

    // Verify ticket belongs to user
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
      },
    })

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found or access denied" })
    }

    const fileInfo = getFileInfo(req.file)

    const prove = await prisma.prove.create({
      data: {
        name: name || req.file.originalname,
        path: fileInfo.filename,
        ticketId: ticketId,
      },
      include: {
        ticket: true,
      },
    })

    res.status(201).json({
      ...prove,
      fileInfo: {
        originalName: fileInfo.originalName,
        size: fileInfo.size,
        mimetype: fileInfo.mimetype,
      },
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
})

export default router
