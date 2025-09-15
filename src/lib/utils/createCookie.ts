import { TokenResponse } from "../../domain/dto/Authorization/TokenResponse"
import { Response } from "express"

// Add cookie helpers
const isProd = false
const ACCESS_TOKEN_MAX_AGE_MS = isProd ? 15 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000 // isProd ? 15 minutes : 30 days
const REFRESH_TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

export const setAuthCookies = (res: Response, tokens: TokenResponse) => {
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
