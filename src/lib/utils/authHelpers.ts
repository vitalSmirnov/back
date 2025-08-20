import { TokenResponse } from "../../domain/dto/Authorization/TokenResponse.js"
import { User } from "../../domain/models/user.js"
import jwt from "jsonwebtoken"
import { UserRole } from "../../domain/models/UserRoleEnum.js"
import { type Request, type Response, NextFunction } from "express"

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || "dev_secret"
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_dev_secret"

export interface JwtPayload {
  id: string
  role: UserRole
}

export function createTokens({ id, role }: Pick<User, "id" | "role">): TokenResponse {
  const accessToken = jwt.sign({ id: id, role: role }, ACCESS_TOKEN_SECRET, { expiresIn: "15m" })

  const refreshToken = jwt.sign({ id: id, role: role }, REFRESH_TOKEN_SECRET, { expiresIn: "7d" })

  return { accessToken, refreshToken }
}

export function signAccessToken(user: { id: string; role: UserRole }): string {
  return jwt.sign({ id: user.id, role: user.role }, ACCESS_TOKEN_SECRET, { expiresIn: "15m" })
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload
}

// Helper: extract Bearer token from Authorization header
function extractBearerToken(authHeader?: string | null): string | null {
  if (!authHeader) return null
  const match = authHeader.match(/^Bearer\s+(.+)$/i)
  return match ? match[1].trim() : null
}

// Helper: parse raw Cookie header if req.cookies is not available
function parseCookieHeader(cookieHeader?: string): Record<string, string> {
  const out: Record<string, string> = {}
  if (!cookieHeader) return out
  for (const part of cookieHeader.split(";")) {
    const [k, ...vparts] = part.split("=")
    if (!k) continue
    const key = k.trim()
    const value = vparts.join("=").trim()
    if (key) out[key] = decodeURIComponent(value || "")
  }
  return out
}

// Helper: get access token from request (Authorization header or cookies)
function getTokenFromRequest(req: Request): string | null {
  // 1) Authorization header
  const authHeader = req.headers.authorization ?? (typeof req.get === "function" ? req.get("authorization") : undefined)
  const fromAuth = extractBearerToken(authHeader)
  if (fromAuth) return fromAuth

  // 2) Cookies via cookie-parser
  const candidateCookieNames = ["accessToken"]
  const cookies: Record<string, unknown> | undefined = (req as any).cookies
  if (cookies) {
    for (const name of candidateCookieNames) {
      const v = cookies[name]
      if (typeof v === "string" && v) return v
    }
  }

  // 3) Raw Cookie header fallback
  const parsed = parseCookieHeader(req.headers.cookie)
  for (const name of candidateCookieNames) {
    const v = parsed[name]
    if (typeof v === "string" && v) return v
  }

  return null
}

export function JwtAuth(req: Request, res: Response, next: NextFunction) {
  const authCookie = req.cookies["accessToken"]
  const authToken = req.headers["authorization"]?.split("Bearer ")[1]

  // If there is no cookie, return an error
  if (authCookie == null && authToken == null) return res.sendStatus(401)

  const authData = authCookie || authToken
  jwt.verify(authData, ACCESS_TOKEN_SECRET, (err: any) => {
    // If there is an error, return an error
    if (err) return res.sendStatus(401)
    req.headers.authorization = authData // Set the authorization header for downstream middleware
    next()
  })
}
