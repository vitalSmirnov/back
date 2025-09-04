import express, { Request, Response } from "express"
import { JwtAuth, JwtRefreshAuth } from "../lib/utils/authHelpers.js"
import { getRoleFromHeaders } from "../lib/utils/getRoleFromHeader.js"
import { setAuthCookies } from "../lib/utils/createCookie.js"
import { ErrorResponse } from "../domain/dto/ErrorResponse.js"
import {
  LoginPayload,
  LoginResponse,
  RefreshPayload,
  RefreshResponse,
  RegisterPayload,
  RegisterResponse,
} from "./interfaces/auth.js"
import { loginService, refreshService, registerService } from "../services/authService.js"

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
      console.error("Error registering user:", error)
      return res
        .status(500)
        .json({ error: error instanceof Error ? error.message : "Ошибка регистрации, попробуйте снова позже" })
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
    console.error("Error logging in:", error)
    return res
      .status(500)
      .json({ error: error instanceof Error ? error.message : "Ошибка авторизации, попробуйте снова позже" })
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
      console.error("Error refreshing token:", error)
      return res
        .status(500)
        .json({ error: error instanceof Error ? error.message : "Ошибка авторизации, попробуйте снова позже" })
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
    console.error("Error logging out:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
})

export default router
