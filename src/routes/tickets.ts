import express, { type Request, type Response } from "express"
import { isAdmin } from "../middlewares/authMiddleware"
import { StatusEnum } from "../domain/models/StatusEnum"
import { CreateTicketInfoPayload, CreateTicketInfoResponse } from "../domain/dto/Tickets/Tickets"

import { getRoleFromHeaders } from "../lib/utils/getRoleFromHeader"
import { JwtAuth } from "../lib/utils/authHelpers"
import {
  changeStatusTicketService,
  createTicketService,
  getTicketIdService,
  getTicketListService,
  updateTicketService,
} from "../services/ticketsService"
import { ErrorResponse } from "../domain/dto/ErrorResponse"
import {
  ChangeStatusTicketPayload,
  ChangeStatusTicketResponse,
  GetTicketIdResponse,
  GetTicketListPayload,
  GetTicketListResponse,
  UpdateTicketPayload,
  UpdateTicketResponse,
} from "./interfaces/tickets"
import { HttpError } from "../lib/error/Error"

const router = express.Router()
router.use(JwtAuth)

// get tickets list endpoint
router.get(
  "/",
  async (req: Request<{}, {}, {}, GetTicketListPayload>, res: Response<GetTicketListResponse | ErrorResponse>) => {
    try {
      const decoded = getRoleFromHeaders(req.headers.authorization!)
      const result = await getTicketListService({ ...req.query, roles: decoded?.role || [], userId: decoded?.id! })
      return res.status(200).json(result)
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

// get ticket by ID endpoint
router.get("/:id", async (req: Request<{ id: string }>, res: Response<GetTicketIdResponse | ErrorResponse>) => {
  try {
    const decoded = getRoleFromHeaders(req.headers.authorization!)
    const ticket = await getTicketIdService({ id: req.params.id, roles: decoded?.role || [], userId: decoded?.id! })
    return res.status(200).json(ticket)
  } catch (error) {
    const errorMessage =
      error instanceof HttpError
        ? { message: error.message, status: error.statusCode }
        : { message: "Что-то пошло не так, попробуйте позже", status: 500 }
    console.error("Error logging out:", error)
    return res.status(errorMessage.status).json({ error: errorMessage.message })
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
      const errorMessage =
        error instanceof HttpError
          ? { message: error.message, status: error.statusCode }
          : { message: "Что-то пошло не так, попробуйте позже", status: 500 }
      console.error("Error logging out:", error)
      return res.status(errorMessage.status).json({ error: errorMessage.message })
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
      const errorMessage =
        error instanceof HttpError
          ? { message: error.message, status: error.statusCode }
          : { message: "Что-то пошло не так, попробуйте позже", status: 500 }
      console.error("Error logging out:", error)
      return res.status(errorMessage.status).json({ error: errorMessage.message })
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
