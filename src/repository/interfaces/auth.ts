import { LoginCredentials, RegisterCredentials } from "../../domain/dto/Authorization/LoginCredentials"
import { UserRole } from "../../domain/models/UserRoleEnum"

export interface RegisterRepositoryPayload extends RegisterCredentials {}

export interface RegisterRepositoryResponse {
  id: string
  login: string
  name: string
  role: UserRole[]
}

export interface LoginRepositoryPayload extends LoginCredentials {}

export interface LoginRepositoryResponse {
  id: string
  login: string
  name: string
  role: UserRole[]
  password: string
}

export interface RefreshRepositoryPayload {
  id: string
}

export interface RefreshRepositoryResponse {
  id: string
  login: string
  name: string
  role: UserRole[]
}
