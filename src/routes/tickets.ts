import express, { type Request, type Response } from "express"
import { isAdmin, isUser } from "../middlewares/authMiddleware.js"
import { StatusEnum } from "../domain/models/StatusEnum.js"
import { UserRoleEnum } from "../domain/models/UserRoleEnum.js"
import {
  ChangeTicketStatusPayload,
  CreateTicketInfoPayload,
  CreateTicketInfoResponse,
  UpdateTicketInfoPayload,
  UpdateTicketInfoResponse,
} from "../domain/dto/Tickets/Tickets.js"
import { ReasonEnum } from "../domain/models/ReasonEnum.js"
import prisma from "../prisma.js"
import { getRoleFromHeaders } from "../lib/utils/getRoleFromHeader.js"
import { JwtAuth } from "../lib/utils/authHelpers.js"
import {
  changeStatusTicketService,
  createTicketService,
  getTicketIdService,
  getTicketListService,
  updateTicketService,
} from "../services/ticketsService.js"
import { ErrorResponse } from "../domain/dto/ErrorResponse.js"
import {
  ChangeStatusTicketPayload,
  ChangeStatusTicketResponse,
  GetTicketIdResponse,
  GetTicketListPayload,
  GetTicketListResponse,
  UpdateTicketPayload,
  UpdateTicketResponse,
} from "./interfaces/tickets.js"

const router = express.Router()
router.use(JwtAuth)

// helper to normalize prove path/file binary into a safe string for JSON responses
const encodeProvePath = (p: any): string => {
  // p may be { path: Buffer|Uint8Array|string } or { file: { res: Buffer|Uint8Array } }
  if (!p) return ""
  const val = p.path ?? p.file?.res ?? p.file?.path
  if (!val) return ""
  // Buffer or Uint8Array -> base64, otherwise stringify
  if (typeof Buffer !== "undefined" && (Buffer.isBuffer(val) || val instanceof Uint8Array)) {
    return Buffer.from(val).toString("base64")
  }
  return String(val)
}

// get tickets list endpoint
router.get(
  "/",
  async (req: Request<{}, {}, {}, GetTicketListPayload>, res: Response<GetTicketListResponse | ErrorResponse>) => {
    try {
      const decoded = getRoleFromHeaders(req.headers.authorization!)
      const result = await getTicketListService({ ...req.query, roles: decoded?.role || [], userId: decoded?.id! })
      return res.status(200).json(result)
    } catch (error) {
      console.error("Error fetching tickets:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }
)

// get ticket by ID endpoint
router.get("/:id", async (req: Request<{ id: string }>, res: Response<GetTicketIdResponse | ErrorResponse>) => {
  try {
    const decoded = getRoleFromHeaders(req.headers.authorization!)
    const ticket = await getTicketIdService({ id: req.params.id, roles: decoded?.role || [], userId: decoded?.id! })
    return res.status(200).json(ticket)
  } catch (error) {
    console.error("Error fetching ticket:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
})

// create ticket endpoint
router.post(
  "/",
  async (
    req: Request<{}, {}, CreateTicketInfoPayload>,
    res: Response<CreateTicketInfoResponse | { error: string }>
  ) => {
    try {
      const decoded = getRoleFromHeaders(req.headers.authorization!)
      const response = await createTicketService({ ...req.body, userId: decoded?.id! })
      res.status(201).json(response)
    } catch (error) {
      console.error("Error creating ticket:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }
)

// update ticket endpoint
router.put(
  "/:id",
  async (
    req: Request<{ id: string }, {}, UpdateTicketPayload>,
    res: Response<UpdateTicketResponse | ErrorResponse>
  ) => {
    try {
      const decoded = getRoleFromHeaders(req.headers.authorization!)

      const response = await updateTicketService({
        ...req.body,
        id: req.params.id,
        roles: decoded?.role || [],
        userId: decoded?.id!,
      })
      return res.status(200).json(response)
    } catch (error) {
      console.error("Error updating ticket:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }
)

router.patch(
  "/:id/status",
  isAdmin,
  async (
    req: Request<{ id: string }, {}, ChangeStatusTicketPayload>,
    res: Response<ChangeStatusTicketResponse | ErrorResponse>
  ) => {
    try {
      const { status } = req.body

      // Validate status value
      if (!status || ![StatusEnum.PENDING, StatusEnum.APPROVED, StatusEnum.REJECTED].includes(status)) {
        return res.status(400).json({
          error: "Invalid status. Must be PENDING, APPROVED or REJECTED",
        })
      }

      const ticket = await changeStatusTicketService({ id: req.params.id, status })
      return res.status(200).json(ticket)
    } catch (error) {
      console.error("Error updating ticket status:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }
)

export default router
