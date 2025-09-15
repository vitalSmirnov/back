import express, { Request, Response } from "express"
import { JwtAuth, JwtRefreshAuth } from "../lib/utils/authHelpers"
import { getRoleFromHeaders } from "../lib/utils/getRoleFromHeader"
import { setAuthCookies } from "../lib/utils/createCookie"
import { ErrorResponse } from "../domain/dto/ErrorResponse"
import {
  LoginPayload,
  LoginResponse,
  RefreshPayload,
  RefreshResponse,
  RegisterPayload,
  RegisterResponse,
} from "./interfaces/auth"
import { loginService, refreshService, registerService } from "../services/authService"
import { HttpError } from "../lib/error/Error"

const router = express.Router()

// Register endpoint
router.post(
  "/register",
  async (req: Request<{}, {}, RegisterPayload>, res: Response<RegisterResponse | ErrorResponse>) => {
    try {
      const tokens = await registerService(req.body)
      setAuthCookies(res, tokens)
      res.status(201).json(tokens)
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

// Login endpoint
router.post("/login", async (req: Request<{}, {}, LoginPayload>, res: Response<LoginResponse | ErrorResponse>) => {
  try {
    const tokens = await loginService(req.body)
    setAuthCookies(res, tokens)
    res.status(200).json(tokens)
  } catch (error) {
    const errorMessage =
      error instanceof HttpError
        ? { message: error.message, status: error.statusCode }
        : { message: "Что-то пошло не так, попробуйте позже", status: 500 }
    console.error("Error logging out:", error)
    return res.status(errorMessage.status).json({ error: errorMessage.message })
  }
})

// Refresh token endpoint
router.post(
  "/refresh",
  JwtRefreshAuth,
  async (req: Request<{}, {}, RefreshPayload>, res: Response<RefreshResponse | ErrorResponse>) => {
    try {
      const token = req.headers.refreshToken as string
      const refreshData = req.body.refreshToken || token

      if (!refreshData) return res.status(400).json({ error: "Отсутствует токен пользователя" })

      const decoded = getRoleFromHeaders(refreshData)

      const tokens = await refreshService({ id: decoded.id })
      setAuthCookies(res, tokens)
      res.status(200).json(tokens)
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

// Logout endpoint
router.post("/logout", JwtAuth, async (req: Request, res: Response) => {
  try {
    res.clearCookie("accessToken", { path: "/" })
    res.clearCookie("refreshToken", { path: "/" })
    res.json({ message: "Logged out successfully" })
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
