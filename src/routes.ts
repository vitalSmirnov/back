import express from "express"
import authRouter from "./routes/auth.js"
import usersRouter from "./routes/users.js"
import ticketsRouter from "./routes/tickets.js"
import proovesRouter from "./routes/prooves.js"
import uploadRouter from "./routes/uploadFiles.js"
import courseRouter from "./routes/course.js"
import groupRouter from "./routes/group.js"

const router = express.Router()

router.use("/auth", authRouter)
router.use("/users", usersRouter)
router.use("/tickets", ticketsRouter)
router.use("/prooves", proovesRouter)
router.use("/upload", uploadRouter)
router.use("/groups", groupRouter)
router.use("/course", courseRouter)

export default router
