import express, { type Request, type Response } from "express"
import { isAdmin, isUser } from "../middlewares/authMiddleware.js"
import { StatusEnum } from "../domain/models/StatusEnum.js"
import { UserRoleEnum } from "../domain/models/UserRoleEnum.js"
import {
  ChangeTicketStatusPayload,
  CreateTicketInfoPayload,
  CreateTicketInfoResponse,
  GetTicketResponse,
  GetTicketsPayload,
  GetTicketsResponse,
  UpdateTicketInfoPayload,
  UpdateTicketInfoResponse,
} from "../domain/dto/Tickets/Tickets.js"
import { ReasonEnum } from "../domain/models/ReasonEnum.js"
import prisma from "../prisma.js"
import { getRoleFromHeaders } from "../lib/utils/getRoleFromHeader.js"
import { JwtAuth } from "../lib/utils/authHelpers.js"

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

router.get(
  "/",
  async (req: Request<{}, {}, {}, GetTicketsPayload>, res: Response<GetTicketsResponse | { error: string }>) => {
    try {
      const decoded = getRoleFromHeaders(req.headers.authorization!)
      const { userName, startDate, endDate, offset, limit, reason, status } = req.query
      if (decoded?.role.includes(UserRoleEnum.PROFESSOR) || decoded?.role.includes(UserRoleEnum.ADMIN)) {
        const tickets = await prisma.ticket.findMany({
          where: {
            user: {
              name: {
                contains: userName,
                mode: "insensitive",
              },
            },
            reason: reason,
            status: status,
            endDate: endDate ? { lte: new Date(endDate) } : undefined,
            startDate: { gte: startDate ? new Date(startDate) : undefined },
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
                course: { select: { id: true, identifier: true, name: true } }, // added id
                group: { select: { id: true, identifier: true } }, // added id
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
            prooves: ticket.prooves.map(p => ({
              id: p.id,
              name: p.name,
              // normalize any binary into a base64 string for JSON
              path: encodeProvePath(p),
            })),
          })),
          total: tickets.length,
        } as unknown as GetTicketsResponse)
      }

      const tickets = await prisma.ticket.findMany({
        where: { userId: decoded?.id },
        include: {
          user: {
            include: {
              course: { select: { id: true, identifier: true, name: true } },
              group: { select: { id: true, identifier: true } },
            },
          },
          prooves: {
            select: { id: true, name: true, path: true },
          },
        },
      })
      return res.json({
        tickets: tickets.map(ticket => ({
          ...ticket,
          startDate: ticket.startDate.toISOString(),
          endDate: ticket.endDate.toISOString(),
          reason: ticket.reason as ReasonEnum,
          status: ticket.status as StatusEnum,
          prooves: ticket.prooves.map(p => ({
            id: p.id,
            name: p.name,
            path: p.path,
          })),
        })),
        total: tickets.length,
      } as unknown as GetTicketsResponse)
    } catch (error) {
      console.error("Error fetching tickets:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }
)

router.get("/:id", async (req: Request, res: Response<GetTicketResponse | { error: string }>) => {
  try {
    const decoded = getRoleFromHeaders(req.headers.authorization!)
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      select: {
        userId: false, // keep userId for authorization check
        id: true,
        name: true,
        description: true,
        startDate: true,
        endDate: true,
        reason: true,
        status: true,
        user: {
          include: {
            course: { select: { id: true, identifier: true, name: true } },
            group: { select: { id: true, identifier: true } },
          },
        },
        prooves: {
          select: { id: true, name: true, path: true },
        },
      },
    })

    if (!ticket) return res.status(404).json({ error: "Not found" })

    if (
      decoded?.role.includes(UserRoleEnum.ADMIN) ||
      decoded?.role.includes(UserRoleEnum.PROFESSOR) ||
      ticket.user.id === decoded?.id
    ) {
      const response: GetTicketResponse = {
        ...ticket,
        reason: ticket.reason as ReasonEnum,
        status: ticket.status as StatusEnum,
        startDate: ticket.startDate.toISOString(),
        endDate: ticket.endDate.toISOString(),
        prooves: ticket.prooves.map(p => ({
          id: p.id,
          name: p.name,
          path: p.path,
        })),
      }
      return res.json(response as unknown as GetTicketResponse)
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
  async (
    req: Request<{ id: string }, {}, CreateTicketInfoPayload>,
    res: Response<CreateTicketInfoResponse | { error: string }>
  ) => {
    const decoded = getRoleFromHeaders(req.headers.authorization!)
    // ensure we have a valid user ID
    if (!decoded?.id) return res.status(401).json({ error: "Unauthorized" })

    try {
      const { name, description, startDate, endDate, reason, prooves } = req.body

      const proovesCreate =
        Array.isArray(req.body.prooves) && req.body.prooves.length > 0
          ? {
              deleteMany: {},
              createMany: {
                data: req.body.prooves.map((item: any, index: number) => ({
                  name: `Prove for ticket ${req.params.id} - ${index + 1}`,
                  path: item,
                })),
              },
            }
          : Array.isArray(req.body.prooves) && req.body.prooves.length === 0
          ? {
              // empty array provided -> remove all existing prooves
              deleteMany: {},
            }
          : undefined

      const ticket = await prisma.ticket.create({
        data: {
          name: name || "Sick Day",
          description,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          reason: reason || ReasonEnum.SICKDAY,
          status: StatusEnum.PENDING,
          userId: decoded!.id,
          prooves: proovesCreate,
        },
        include: {
          user: true,
          prooves: {
            select: { id: true, name: true, path: true },
          },
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
        prooves: ticket.prooves.map(p => ({
          id: p.id,
          name: p.name,
          path: p.path,
        })),
      }

      res.status(201).json(response as unknown as CreateTicketInfoResponse)
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
        where: { id: req.params.id },
      })

      if (!ticket) return res.status(404).json({ error: "Not found" })
      if (ticket.status !== StatusEnum.PENDING) return res.status(403).json({ error: "Not avialable to edit" })

      if (decoded?.role.includes(UserRoleEnum.ADMIN) || ticket.userId === decoded?.id) {
        // build update fields and convert date strings to Date objects
        const updateData: any = {
          name: req.body.name,
          description: req.body.description,
          reason: req.body.reason,
          endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
        }

        // remove undefined fields so Prisma won't try to set them
        Object.keys(updateData).forEach(key => {
          if (updateData[key] === undefined) delete updateData[key]
        })

        // prepare nested prooves update to replace existing ones
        const proovesUpdate =
          Array.isArray(req.body.prooves) && req.body.prooves.length > 0
            ? {
                deleteMany: {},
                createMany: {
                  data: req.body.prooves.map((item: any, index: number) => ({
                    name: `Prove for ticket ${req.params.id} - ${index + 1}`,
                    path: item,
                  })),
                },
              }
            : Array.isArray(req.body.prooves) && req.body.prooves.length === 0
            ? {
                // empty array provided -> remove all existing prooves
                deleteMany: {},
              }
            : undefined

        const updatedTicket = await prisma.ticket.update({
          where: { id: req.params.id },
          data: {
            ...updateData,
            prooves: proovesUpdate,
          },
          include: {
            user: true,
            prooves: {
              select: { id: true, name: true, path: true },
            },
          },
        })

        const response: UpdateTicketInfoResponse = {
          ...updatedTicket,
          status: updatedTicket.status as StatusEnum,
          reason: updatedTicket.reason as ReasonEnum,
          startDate: updatedTicket.startDate.toISOString(),
          endDate: updatedTicket.endDate.toISOString(),
          prooves: updatedTicket.prooves.map(p => ({
            id: p.id,
            name: p.name,
            path: p.path,
          })),
        }
        return res.json(response)
      } else {
        return res.status(403).json({ error: "Forbidden" })
      }
    } catch (error) {
      console.error("Error updating ticket:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }
)

router.delete("/:id", isUser, async (req: Request<{ id: string }>, res: Response) => {
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
        where: { id: req.params.id, NOT: { status: status } },
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

      // normalize prooves before returning
      return res.json({
        ...updatedTicket,
        reason: updatedTicket.reason as ReasonEnum,
        prooves: updatedTicket.prooves.map(p => ({
          id: p.id,
          name: p.name,
          path: encodeProvePath(p),
        })),
      })
    } catch (error) {
      console.error("Error updating ticket status:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }
)

export default router
