import { uploadSingle, handleUploadError } from "../middlewares/uploadMiddleware.js"
import { getFileInfo } from "../lib/utils/fileUtils.js"
import { type Request, type Response } from "express"
import { JwtAuth } from "../lib/utils/authHelpers.js"
import express from "express"

const router = express.Router()
router.use(JwtAuth)

router.post("/upload", uploadSingle, handleUploadError, async (req: Request, res: Response) => {
  console.log(req)
  try {
    const file = req.file as Express.Multer.File | undefined
    if (!file) return res.status(400).json({ error: "No file uploaded" })

    const fileInfo = getFileInfo(file)

    res.status(201).json({
      message: "File uploaded successfully",
      file: {
        path: `uploads/proves/${fileInfo.filename}`,
        originalName: fileInfo.filename,
        size: fileInfo.size,
      },
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
})

// GET list of files (without sending raw buffers)
// changed: fetch nested file relation and return either raw binary or a base64 data URL + metadata
// router.get("/get/:id", isUser, async (req: Request<{ id: string }>, res: Response) => {
//   try {
//     const fileRecord = await prisma.fileModel.findUnique({
//       where: { id: req.params.id },
//     })

//     if (!fileRecord || !fileRecord.res) return res.status(404).json({ error: "File not found" })

//     const buffer: Buffer = fileRecord.res as Buffer
//     const mimetype = fileRecord.mimetype ?? "application/octet-stream"
//     const originalName = fileRecord.originalName ?? "file"

//     // If client requests raw binary (useful when fetching an <img src="/files/:id?raw=true">)
//     if (String(req.query.raw).toLowerCase() === "true") {
//       res.setHeader("Content-Type", mimetype)
//       res.setHeader("Content-Length", buffer.length.toString())
//       return res.send(buffer)
//     }

//     // Otherwise return a JSON payload with a base64 data URL + metadata (easy to use on frontend)
//     const base64 = buffer.toString("base64")
//     const dataUrl = `data:${mimetype};base64,${base64}`

//     return res.json({
//       id: fileRecord.id,
//       file: dataUrl,
//       mimeType: mimetype,
//       originalName,
//       uploaded: fileRecord.uploaded,
//     })
//   } catch (error) {
//     console.error("Error fetching files:", error)
//     return res.status(500).json({ error: "Internal server error" })
//   }
// })

export default router
