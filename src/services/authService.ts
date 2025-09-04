import { UserRole } from "@prisma/client"
import prisma from "../prisma.js"
import {
  LoginServicePayload,
  LoginServiceResponse,
  RefreshServicePayload,
  RefreshServiceResponse,
  RegisterServicePayload,
  RegisterServiceResponse,
} from "./interfaces/auth.js"
import { createTokens } from "../lib/utils/authHelpers.js"
import { HttpError } from "../lib/error/Error.js"

export async function registerService({
  login,
  name,
  password,
  course,
  group,
}: RegisterServicePayload): Promise<RegisterServiceResponse> {
  const existingUser = await prisma.user.findUnique({
    where: { login },
  })

  if (existingUser) {
    throw new HttpError("Логин уже используется", 401)
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
  const tokens = createTokens(user)

  return tokens
}

export async function loginService({ login, password }: LoginServicePayload): Promise<LoginServiceResponse> {
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

  if (!user) throw new HttpError("Пользователь с таким логином не существует", 401)

  if (password !== user.password) throw new HttpError("Неправильный пароль или логин", 401)

  const tokens = createTokens(user)

  return tokens
}
export async function refreshService({ id }: RefreshServicePayload): Promise<RefreshServiceResponse> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      role: true,
    },
  })

  if (!user) {
    throw new HttpError("Пользователь не найден", 404)
  }

  const tokens = createTokens(user)

  return tokens
}
