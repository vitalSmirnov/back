import { UserRole } from "@prisma/client"
import { HttpError } from "../lib/error/Error"
import prisma from "../prisma"
import {
  LoginRepositoryPayload,
  LoginRepositoryResponse,
  RegisterRepositoryPayload,
  RegisterRepositoryResponse,
  RefreshRepositoryPayload,
  RefreshRepositoryResponse,
} from "./interfaces/auth"

export async function registerRepository({
  login,
  name,
  password,
  group,
}: RegisterRepositoryPayload): Promise<RegisterRepositoryResponse> {
  try {
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
        group: { connect: { id: group } },
      },
      select: {
        id: true,
        login: true,
        name: true,
        role: true,
        password: false,
      },
    })

    return user
  } catch (e) {
    if (e instanceof HttpError) {
      throw e
    }
    throw new HttpError("Ошибка базы данных", 500)
  }
}

export async function loginRepository({ login, password }: LoginRepositoryPayload): Promise<LoginRepositoryResponse> {
  try {
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
      throw new HttpError("Пользователь с таким логином не существует", 401)
    }

    if (password !== user.password) {
      throw new HttpError("Неправильный пароль или логин", 401)
    }

    return user
  } catch (e) {
    if (e instanceof HttpError) {
      throw e
    }
    throw new HttpError("Ошибка базы данных", 500)
  }
}

export async function refreshRepository({ id }: RefreshRepositoryPayload): Promise<RefreshRepositoryResponse> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        login: true,
        name: true,
        role: true,
        password: false,
      },
    })

    if (!user) {
      throw new HttpError("Пользователь не найден", 404)
    }

    return user
  } catch (e) {
    if (e instanceof HttpError) {
      throw e
    }
    throw new HttpError("Ошибка базы данных", 500)
  }
}
