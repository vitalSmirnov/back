import express, { Request, Response } from "express"
import { LoginCredentials, RegisterCredentials } from "../domain/dto/Authorization/LoginCredentials.js"
import { TokenResponse } from "../domain/dto/Authorization/TokenResponse.js"
import { createTokens, JwtAuth } from "../lib/utils/authHelpers.js"
import prisma from "../prisma.js"
import { getRoleFromHeaders } from "../lib/utils/getRoleFromHeader.js"

const router = express.Router()

// Add cookie helpers
const isProd = false
const ACCESS_TOKEN_MAX_AGE_MS = isProd ? 15 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000 // isProd ? 15 minutes : 30 days
const REFRESH_TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

const setAuthCookies = (res: Response, tokens: TokenResponse) => {
  res.cookie("accessToken", tokens.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    maxAge: ACCESS_TOKEN_MAX_AGE_MS,
  })
  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: isProd,
    path: "localhost/*",
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
  })
}

// Register endpoint
router.post(
  "/register",
  async (req: Request<{}, {}, RegisterCredentials>, res: Response<TokenResponse | { error: string }>) => {
    try {
      const { login, name, password, course, group } = req.body
      // Validate required fields
      if (!login || !name || !password) {
        return res.status(400).json({
          error: "Missing required fields: login, name, password, role",
        })
      }

      const existingUser = await prisma.user.findUnique({
        where: { login },
      })

      if (existingUser) {
        return res.status(409).json({ error: "User with this login already exists" })
      }

      const user = await prisma.user.create({
        data: {
          login,
          name,
          password,
          role: "STUDENT",
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
      return res.status(500).json({ error: "Internal server error" })
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
          error: "Missing required fields: login, password",
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

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" })
      }
      if (password !== user.password) {
        return res.status(401).json({ error: "Invalid credentials" })
      }

      const tokens = createTokens(user)
      setAuthCookies(res, tokens)
      res.status(201).json(tokens)
    } catch (error) {
      console.error("Error logging in:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }
)

// Refresh token endpoint
router.post(
  "/refresh",
  async (req: Request<{}, {}, { refreshToken: string }>, res: Response<TokenResponse | { error: string }>) => {
    try {
      const cookies = req.headers.cookie
      const refreshToken = cookies?.match(/refreshToken=([^;]+)/)?.[1] || req.body.refreshToken

      if (!refreshToken) {
        return res.status(400).json({ error: "Refresh token is required" })
      }

      // Verify refresh token
      const decoded = getRoleFromHeaders(refreshToken)

      console.log("Decoded refresh token:", decoded)

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
        return res.status(401).json({ error: "User not found" })
      }

      const tokens = createTokens(user)
      setAuthCookies(res, tokens)

      res.status(201).json(tokens)
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
