import { LoginCredentials, RegisterCredentials } from "../../domain/dto/Authorization/LoginCredentials.js"
import { TokenResponse } from "../../domain/dto/Authorization/TokenResponse.js"

export interface RegisterServicePayload extends RegisterCredentials {}
export interface RegisterServiceResponse extends TokenResponse {}

export interface LoginServicePayload extends LoginCredentials {}
export interface LoginServiceResponse extends TokenResponse {}

export interface RefreshServicePayload {
  id: string
}
export interface RefreshServiceResponse extends TokenResponse {}
