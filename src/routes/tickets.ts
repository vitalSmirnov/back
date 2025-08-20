import express, { type Request, type Response } from "express"
import { isAdmin, isUser } from "../middlewares/authMiddleware.js"
import { StatusEnum } from "../domain/models/StatusEnum.js"
import { UserRoleEnum } from "../domain/models/UserRoleEnum.js"
import {
  ChangeTicketStatusPayload,
  CreateTicketInfoPayload,
  CreateTicketInfoResponse,
  GetTicketsPayload,
  GetTicketsResponse,
  UpdateTicketInfoPayload,
  UpdateTicketInfoResponse,
} from "../domain/dto/Tickets/Tickets.js"
import { Ticket } from "../domain/models/ticket.js"
import { ReasonEnum } from "../domain/models/ReasonEnum.js"
import prisma from "../prisma.js"
import { getRoleFromHeaders } from "../lib/utils/getRoleFromHeader.js"
import { JwtAuth } from "../lib/utils/authHelpers.js"

const router = express.Router()
router.use(JwtAuth)

router.get(
  "/",
  async (req: Request<{}, {}, {}, GetTicketsPayload>, res: Response<GetTicketsResponse | { error: string }>) => {
    try {
      const decoded = getRoleFromHeaders(req.headers.authorization!)
      const { userName, startDate, endDate, offset, limit, reason } = req.query
      if (decoded?.role === UserRoleEnum.PROFESSOR || decoded?.role === UserRoleEnum.ADMIN) {
        const tickets = await prisma.ticket.findMany({
          where: {
            user: {
              name: {
                contains: userName,
                mode: "insensitive",
              },
            },
            reason: reason,
            endDate: endDate ? { lte: new Date(endDate) } : undefined,
            startDate: { gte: startDate ? new Date(startDate) : undefined },
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
                course: { select: { identifier: true } },
                group: { select: { identifier: true } },
              },
            },
            prooves: true,
          },

          orderBy: {
            startDate: "desc",
          },
          skip: offset ? parseInt(offset) : 0,
          take: limit ? parseInt(limit) : 100,
        })
        return res.json({
          tickets: tickets.map(ticket => ({
            ...ticket,
            startDate: ticket.startDate.toISOString(),
            endDate: ticket.endDate.toISOString(),
            reason: ticket.reason as ReasonEnum,
            status: ticket.status as StatusEnum,
          })),
          total: tickets.length,
        })
      }

      const tickets = await prisma.ticket.findMany({
        where: { userId: decoded?.id },
        include: {
          user: true,
          prooves: true,
        },
      })
      return res.json({
        tickets: tickets.map(ticket => ({
          ...ticket,
          startDate: ticket.startDate.toISOString(),
          endDate: ticket.endDate.toISOString(),
          reason: ticket.reason as ReasonEnum,
          status: ticket.status as StatusEnum,
        })),
        total: tickets.length,
      })
    } catch (error) {
      console.error("Error fetching tickets:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }
)

router.get("/:id", async (req: Request, res: Response<Ticket | { error: string }>) => {
  try {
    const decoded = getRoleFromHeaders(req.headers.authorization!)
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: {
        user: true,
        prooves: true,
      },
    })

    if (!ticket) return res.status(404).json({ error: "Not found" })

    if (
      decoded?.role === UserRoleEnum.ADMIN ||
      decoded?.role === UserRoleEnum.PROFESSOR ||
      ticket.userId === decoded?.id
    ) {
      return res.json({
        ...ticket,
        reason: ticket.reason as ReasonEnum,
        status: ticket.status as StatusEnum,
        startDate: ticket.startDate.toISOString(),
        endDate: ticket.endDate.toISOString(),
      })
    }

    return res.status(403).json({ error: "Forbidden" })
  } catch (error) {
    console.error("Error fetching ticket:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
})

// create ticket endpoint
router.post(
  "/",
  isUser,
  async (
    req: Request<{ id: string }, {}, CreateTicketInfoPayload>,
    res: Response<CreateTicketInfoResponse | { error: string }>
  ) => {
    const decoded = getRoleFromHeaders(req.headers.authorization!)
    // ensure we have a valid user ID
    if (!decoded?.id) return res.status(401).json({ error: "Unauthorized" })

    try {
      const { name, description, startDate, endDate, reason } = req.body

      const ticket = await prisma.ticket.create({
        data: {
          name: name || "Sick Day",
          description,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          reason: reason || ReasonEnum.SICKDAY,
          status: StatusEnum.PENDING,
          userId: decoded!.id, // <-- non-null asserted here
        },
        include: {
          user: true,
          prooves: true,
        },
      })

      // build a CreateTicketInfoResponse with string dates and proper typing
      const response: CreateTicketInfoResponse = {
        id: ticket.id,
        name: ticket.name,
        description: ticket.description,
        startDate: ticket.startDate.toISOString(),
        endDate: ticket.endDate.toISOString(),
        reason: ticket.reason as ReasonEnum,
        status: ticket.status as StatusEnum,
        userId: ticket.userId,
        prooves: ticket.prooves.map(p => ({
          id: p.id,
          name: p.name,
          path: p.path,
          ticketId: p.ticketId,
        })),
      }

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
    req: Request<{ id: string }, {}, UpdateTicketInfoPayload>,
    res: Response<UpdateTicketInfoResponse | { error: string }>
  ) => {
    try {
      const decoded = getRoleFromHeaders(req.headers.authorization!)

      const ticket = await prisma.ticket.findUnique({
        where: { id: req.params.id, NOT: { status: StatusEnum.APPROVED } },
      })

      if (!ticket) return res.status(404).json({ error: "Not found" })

      if (decoded?.role === UserRoleEnum.ADMIN || ticket.userId === decoded?.id) {
        const updatedTicket = await prisma.ticket.update({
          where: { id: req.params.id },
          data: {
            ...req.body,
            prooves: {
              set: req.body.prooves?.map(item => ({
                id: item.id,
                name: item.name,
                path: item.path,
              })),
            },
          },
          include: {
            user: true,
            prooves: true,
          },
        })
        // Convert Date fields to strings for the UpdateTicketInfoResponse DTO
        const response: UpdateTicketInfoResponse = {
          ...updatedTicket,
          status: updatedTicket.status as StatusEnum,
          reason: updatedTicket.reason as ReasonEnum,
          startDate: updatedTicket.startDate.toISOString(),
          endDate: updatedTicket.endDate.toISOString(),
        }
        return res.json(response)
      }

      return res.status(403).json({ error: "Forbidden" })
    } catch (error) {
      console.error("Error updating ticket:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }
)

router.delete("/:id", isUser, async (req: Request, res: Response) => {
  const decoded = getRoleFromHeaders(req.headers.authorization!)

  try {
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: req.params.id,
        userId: decoded?.id,
        NOT: { status: StatusEnum.APPROVED }, // Prevent deletion of approved tickets
      },
    })

    if (!ticket) return res.status(404).json({ error: "Not found or forbidden" })

    await prisma.ticket.delete({
      where: { id: req.params.id },
    })

    res.status(204).end()
  } catch (error) {
    console.error("Error deleting ticket:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
})

router.patch(
  "/:id/status",
  isAdmin,
  async (req: Request<{ id: string }, {}, ChangeTicketStatusPayload>, res: Response) => {
    try {
      const { status } = req.body

      // Validate status value
      if (!status || ![StatusEnum.PENDING, StatusEnum.APPROVED, StatusEnum.REJECTED].includes(status)) {
        return res.status(400).json({
          error: "Invalid status. Must be PENDING, APPROVED or REJECTED",
        })
      }

      const ticket = await prisma.ticket.findUnique({
        where: { id: req.params.id, NOT: { status: StatusEnum.APPROVED } }, // Prevent status change for approved tickets
      })

      if (!ticket) return res.status(404).json({ error: "Ticket not found" })

      const updatedTicket = await prisma.ticket.update({
        where: { id: req.params.id },
        data: { status },
        include: {
          user: true,
          prooves: true,
        },
      })

      res.json({
        ...updatedTicket,
        reason: updatedTicket.reason as ReasonEnum,
      })
    } catch (error) {
      console.error("Error updating ticket status:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }
)

export default router
