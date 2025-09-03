import express, { Request, Response } from "express"
import { LoginCredentials, RegisterCredentials } from "../domain/dto/Authorization/LoginCredentials.js"
import { TokenResponse } from "../domain/dto/Authorization/TokenResponse.js"
import { createTokens, JwtAuth, JwtRefreshAuth } from "../lib/utils/authHelpers.js"
import prisma from "../prisma.js"
import { getRoleFromHeaders } from "../lib/utils/getRoleFromHeader.js"
import { setAuthCookies } from "../lib/utils/createCookie.js"
import { UserRole } from "@prisma/client"

const router = express.Router()

// Register endpoint
router.post(
  "/register",
  async (req: Request<{}, {}, RegisterCredentials>, res: Response<TokenResponse | { error: string }>) => {
    try {
      const { login, name, password, course, group } = req.body
      // Validate required fields
      if (!login || !name || !password) {
        return res.status(400).json({
          error: "Неправильный запрос, отсутствуют логин, имя или пароль",
        })
      }

      const existingUser = await prisma.user.findUnique({
        where: { login },
      })

      if (existingUser) {
        return res.status(409).json({ error: "Логин уже используется" })
      }

      const user = await prisma.user.create({
        data: {
          login,
          name,
          password,
          role: [UserRole.STUDENT],
          course: { connect: { id: course } },
          group: { connect: { id: group } },
        },
        select: {
          id: true,
          login: true,
          name: true,
          role: true,
          password: false,
          course: true,
        },
      })
      // remove stray "res." and set cookies
      const tokens = createTokens(user)
      setAuthCookies(res, tokens)
      res.status(201).json(tokens)
    } catch (error) {
      console.error("Error registering user:", error)
      return res.status(500).json({ error: "Ошибка регистрации, попробуйте снова позже" })
    }
  }
)

// Login endpoint
router.post(
  "/login",
  async (req: Request<{}, {}, LoginCredentials>, res: Response<TokenResponse | { error: string }>) => {
    try {
      const { login, password } = req.body

      // Validate required fields
      if (!login || !password) {
        return res.status(400).json({
          error: "Неправильный запрос, отсутствуют логин или пароль",
        })
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { login },
        select: {
          id: true,
          login: true,
          name: true,
          role: true,
          password: true,
        },
      })
      console.log(user)

      if (!user) {
        return res.status(401).json({ error: "Пользователь с таким логином не существует" })
      }
      if (password !== user.password) {
        return res.status(401).json({ error: "Неправильный пароль или логин" })
      }

      const tokens = createTokens(user)
      setAuthCookies(res, tokens)
      res.status(200).json(tokens)
    } catch (error) {
      console.error("Error logging in:", error)
      return res.status(500).json({ error: "Ошибка сервера, попробуйте снова" })
    }
  }
)

// Refresh token endpoint
router.post(
  "/refresh",
  JwtRefreshAuth,
  async (req: Request<{}, {}, { refreshToken: string }>, res: Response<TokenResponse | { error: string }>) => {
    try {
      const token = req.headers.refreshToken as string

      const refreshData = req.body.refreshToken || token

      if (!refreshData) {
        return res.status(400).json({ error: "Отсутствует токен пользователя" })
      }

      // Verify refresh token
      const decoded = getRoleFromHeaders(refreshData)

      console.log("decoded Role", decoded)
      console.log("token from headers", token)
      console.log("token from body", refreshData)

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          role: true,
        },
      })

      if (!user) {
        return res.status(404).json({ error: "User not found" })
      }

      const tokens = createTokens(user)
      setAuthCookies(res, tokens)

      res.status(200).json(tokens)
    } catch (error) {
      console.error("Error refreshing token:", error)
      return res.status(500).json({ error: "Internal server error" })
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
