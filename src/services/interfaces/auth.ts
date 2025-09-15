import { LoginCredentials, RegisterCredentials } from "../../domain/dto/Authorization/LoginCredentials"
import { TokenResponse } from "../../domain/dto/Authorization/TokenResponse"

export interface RegisterServicePayload extends RegisterCredentials {}
export interface RegisterServiceResponse extends TokenResponse {}

export interface LoginServicePayload extends LoginCredentials {}
export interface LoginServiceResponse extends TokenResponse {}

export interface RefreshServicePayload {
  id: string
}
export interface RefreshServiceResponse extends TokenResponse {}
