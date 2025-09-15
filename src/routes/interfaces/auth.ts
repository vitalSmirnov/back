import { LoginCredentials, RegisterCredentials } from "../../domain/dto/Authorization/LoginCredentials"
import { TokenResponse } from "../../domain/dto/Authorization/TokenResponse"

export interface RegisterPayload extends RegisterCredentials {}
export interface RegisterResponse extends TokenResponse {}

export interface LoginPayload extends LoginCredentials {}
export interface LoginResponse extends TokenResponse {}

export interface RefreshPayload {
  refreshToken: string
}
export interface RefreshResponse extends TokenResponse {}
