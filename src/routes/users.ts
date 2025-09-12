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
import { HttpError } from "../lib/error/Error.js"

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
      const errorMessage =
        error instanceof HttpError
          ? { message: error.message, status: error.statusCode }
          : { message: "Что-то пошло не так, попробуйте позже", status: 500 }
      console.error("Error logging out:", error)
      return res.status(errorMessage.status).json({ error: errorMessage.message })
    }
  }
)

router.get(
  "/existing",
  isNotStudent,
  async (req: Request<{}, {}, {}, GetUsersNamesPayload>, res: Response<GetUsersNamesResponse | ErrorResponse>) => {
    const { userName } = req.query
    try {
      const result = await getUsersNameService({ name: userName })
      res.status(200).json(result)
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

router.get(
  "/:userId",
  isNotStudent,
  async (req: Request<{ userId: string }>, res: Response<GetConcreteUserResponse | ErrorResponse>) => {
    try {
      const { userId } = req.params

      const result = await getConcreteUserService({ userId })

      res.status(200).json(result)
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

router.delete("/:id", isAdmin, async (req: Request, res: Response) => {
  try {
    const result = await deleteUserService({ userId: req.params.id })

    res.status(204).end(result)
  } catch (error) {
    const errorMessage =
      error instanceof HttpError
        ? { message: error.message, status: error.statusCode }
        : { message: "Что-то пошло не так, попробуйте позже", status: 500 }
    console.error("Error logging out:", error)
    return res.status(errorMessage.status).json({ error: errorMessage.message })
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

      res.status(201).json(result)
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

      res.status(201).json(result)
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
    const errorMessage =
      error instanceof HttpError
        ? { message: error.message, status: error.statusCode }
        : { message: "Что-то пошло не так, попробуйте позже", status: 500 }
    console.error("Error logging out:", error)
    return res.status(errorMessage.status).json({ error: errorMessage.message })
  }
})

export default router
