import {
  LoginServicePayload,
  LoginServiceResponse,
  RefreshServicePayload,
  RefreshServiceResponse,
  RegisterServicePayload,
  RegisterServiceResponse,
} from "./interfaces/auth"
import { createTokens } from "../lib/utils/authHelpers"
import { registerRepository, loginRepository, refreshRepository } from "../repository/authRepository"

export async function registerService(payload: RegisterServicePayload): Promise<RegisterServiceResponse> {
  const user = await registerRepository(payload)
  const tokens = createTokens(user)

  return tokens
}

export async function loginService({ login, password }: LoginServicePayload): Promise<LoginServiceResponse> {
  const user = await loginRepository({ login, password })
  const tokens = createTokens(user)

  return tokens
}
export async function refreshService({ id }: RefreshServicePayload): Promise<RefreshServiceResponse> {
  const user = await refreshRepository({ id })
  const tokens = createTokens(user)

  return tokens
}
