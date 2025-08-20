import express, { type Request, type Response } from "express"
import { isAdmin, isNotStudent } from "../middlewares/authMiddleware.js"
import { JwtAuth } from "../lib/utils/authHelpers.js"
import {
  UserChangeRolePayload,
  UserChangeRoleResponse,
  UserListPayload,
  UserListResponse,
  UserPayload,
  UserResponse,
} from "../domain/dto/Users/UserResponse.js"
import { UserRoleEnum } from "../domain/models/UserRoleEnum.js"
import { ReasonEnum } from "../domain/models/ReasonEnum.js"
import { StatusEnum } from "../domain/models/StatusEnum.js"
import prisma from "../prisma.js"
import { getRoleFromHeaders } from "../lib/utils/getRoleFromHeader.js"

const router = express.Router()
router.use(JwtAuth)

router.get(
  "/",
  isNotStudent,
  async (req: Request<{}, {}, {}, UserListPayload>, res: Response<UserListResponse | { error: string }>) => {
    try {
      console.log("Fetching users with query:", req.query)
      const { userName, group, limit, offset, role, course } = req.query
      const users = await prisma.user.findMany({
        where: {
          name: { contains: userName },
          role: role,
          courseId: { contains: course, mode: "insensitive" },
          groupId: { contains: group, mode: "insensitive" },
        },
        include: {
          course: true,
          group: true,
          tickets: {
            include: { prooves: true },
          },
        },
        skip: offset ? parseInt(offset) : 0,
        take: limit ? parseInt(limit) : 100,
      })

      res.json({
        users: users.map(user => ({
          id: user.id,
          login: user.login,
          name: user.name,
          role: user.role as UserRoleEnum,
          course: user.course?.identifier,
          group: user.group?.identifier,
          tickets: (user.tickets || []).map((ticket: any) => ({
            ...ticket,
            startDate: ticket.startDate.toISOString(),
            endDate: ticket.endDate.toISOString(),
            reason: ticket.reason as ReasonEnum,
            status: ticket.status as StatusEnum,
            prooves: ticket.prooves,
          })),
        })),
        total: users.length,
      })
    } catch (error) {
      console.error("Error fetching users:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }
)

router.get(
  "/:id",
  isNotStudent,
  async (req: Request<{ id: string }, {}, UserPayload>, res: Response<UserResponse | { error: string }>) => {
    try {
      const { id } = req.params
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          course: true,
          group: true,
          tickets: { include: { prooves: true } },
        },
      })

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      res.json({
        id: user.id,
        login: user.login,
        name: user.name,
        role: user.role as UserRoleEnum,
        course: user.course?.identifier,
        group: user.group?.identifier,
        tickets: (user.tickets || []).map((ticket: any) => ({
          ...ticket,
          startDate: ticket.startDate.toISOString(),
          endDate: ticket.endDate.toISOString(),
          reason: ticket.reason as ReasonEnum,
          status: ticket.status as StatusEnum,
          prooves: ticket.prooves,
        })),
      })
    } catch (error) {
      console.error("Error fetching user:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }
)

router.delete("/:id", isAdmin, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    })

    if (!user) return res.status(404).json({ error: "Not found" })

    await prisma.user.delete({
      where: { id: req.params.id },
    })

    res.status(204).end()
  } catch (error) {
    console.error("Error deleting user:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
})

// Grant role to user (Admin only)
router.patch(
  "/:id/role",
  isAdmin,
  async (
    req: Request<{ id: string }, {}, UserChangeRolePayload>,
    res: Response<UserChangeRoleResponse | { error: string }>
  ) => {
    try {
      const { role } = req.body
      const userId = req.params.id

      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) return res.status(404).json({ error: "User not found" })

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role },
        include: { course: true, group: true },
      })

      res.json({
        id: updatedUser.id,
        login: updatedUser.login,
        name: updatedUser.name,
        role: updatedUser.role as UserRoleEnum,
        course: updatedUser.course?.identifier,
        group: updatedUser.group?.identifier,
      })
    } catch (error) {
      console.error("Error granting role:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }
)

// Get current user endpoint
router.get("/me/info", async (req: Request, res: Response) => {
  console.log("Headers:", req.headers)
  try {
    const { id, role } = getRoleFromHeaders(req.headers.authorization!)

    if (!id || id === "") {
      return res.status(401).json({ error: "Error in decoded token" })
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        login: true,
        name: true,
        role: true,
        course: true,
        group: true,
        tickets: {
          include: {
            prooves: true,
          },
        },
      },
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({
      ...user,
      course: user.course?.identifier,
      group: user.group?.identifier,
    })
  } catch (error) {
    console.error("Error getting current user:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
})
// Get current user endpoint
router.get("/info", async (req: Request, res: Response) => {
  console.log("Headers:", req)
  try {
    const token = req.headers.authorization
    const decoded = getRoleFromHeaders(token!)

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        login: true,
        name: true,
        role: true,
      },
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error("Error getting current user:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
})

export default router
