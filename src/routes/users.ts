import express, { type Request, type Response } from "express"
import { isAdmin, isNotStudent } from "../middlewares/authMiddleware.js"
import { JwtAuth } from "../lib/utils/authHelpers.js"
import { UserChangeRolePayload, UserChangeRoleResponse } from "../domain/dto/Users/UserResponse.js"

import { getRoleFromHeaders } from "../lib/utils/getRoleFromHeader.js"
import {
  GetConcreteUserResponse,
  GetUsersNamesPayload,
  GetUsersNamesResponse,
  GetUsersPayload,
  GetUsersResponse,
} from "./interfaces/users.js"
import { ErrorResponse } from "../domain/dto/ErrorResponse.js"
import {
  deleteUserService,
  getConcreteUserService,
  getUsersNameService,
  getUsersService,
  grantRoleService,
  meInfoService,
  rejectRoleService,
} from "../services/usersService.js"

const router = express.Router()
router.use(JwtAuth)

router.get(
  "/",
  isNotStudent,
  async (req: Request<{}, {}, {}, GetUsersPayload>, res: Response<GetUsersResponse | ErrorResponse>) => {
    try {
      const result = await getUsersService({ ...req.query })
      res.status(200).json(result)
    } catch (error) {
      console.error("Error fetching users:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }
)

router.get(
  "/existing",
  isNotStudent,
  async (req: Request<{}, {}, GetUsersNamesPayload>, res: Response<GetUsersNamesResponse | ErrorResponse>) => {
    try {
      const result = await getUsersNameService({})
      res.status(200).json(result)
    } catch (error) {
      console.error("Error fetching users:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }
)

router.get(
  "/:userId",
  isNotStudent,
  async (req: Request<{ userId: string }>, res: Response<GetConcreteUserResponse | ErrorResponse>) => {
    try {
      const { userId } = req.params

      const result = await getConcreteUserService({ userId })

      res.status(200).json(result)
    } catch (error) {
      console.error("Error fetching user:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }
)

router.delete("/:id", isAdmin, async (req: Request, res: Response) => {
  try {
    const result = await deleteUserService({ userId: req.params.id })

    res.status(204).end(result)
  } catch (error) {
    console.error("Error deleting user:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
})

// Grant role to user (Admin only)
router.patch(
  "/:id/role/grant",
  isAdmin,
  async (
    req: Request<{ id: string }, {}, UserChangeRolePayload>,
    res: Response<UserChangeRoleResponse | { error: string }>
  ) => {
    try {
      const { role } = req.body
      const id = req.params.id

      const result = await grantRoleService({ id, role })

      res.status(204).json(result)
    } catch (error) {
      console.error("Error granting role:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }
)
router.patch(
  "/:id/role/reject",
  isAdmin,
  async (
    req: Request<{ id: string }, {}, UserChangeRolePayload>,
    res: Response<UserChangeRoleResponse | { error: string }>
  ) => {
    try {
      const { role } = req.body
      const id = req.params.id

      const result = await rejectRoleService({ id, role })

      res.status(204).json(result)
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
    const { id } = getRoleFromHeaders(req.headers.authorization!)

    if (!id || id === "") {
      return res.status(401).json({ error: "Error in decoded token" })
    }

    const result = await meInfoService({ id })

    res.status(200).json(result)
  } catch (error) {
    console.error("Error getting current user:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
})

export default router
