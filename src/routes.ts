import express from "express"
import authRouter from "./routes/auth"
import usersRouter from "./routes/users"
import ticketsRouter from "./routes/tickets"
import proovesRouter from "./routes/prooves"
import uploadRouter from "./routes/uploadFiles"
import courseRouter from "./routes/course"
import groupRouter from "./routes/group"
import excelRouter from "./routes/excel"

const router = express.Router()

router.use("/auth", authRouter)
router.use("/users", usersRouter)
router.use("/tickets", ticketsRouter)
router.use("/prooves", proovesRouter)
router.use("/media", uploadRouter)
router.use("/groups", groupRouter)
router.use("/course", courseRouter)
router.use("/excel", excelRouter)

export default router
