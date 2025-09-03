import { UserRole } from "@prisma/client"
import jwt from "jsonwebtoken"
import { JwtPayload } from "jsonwebtoken"
import { UserRoleEnum } from "../../domain/models/UserRoleEnum.js"

export function getRoleFromHeaders(token: string): { id: string; role: UserRole[] } {
  try {
    const payload = jwt.decode(token) as JwtPayload
    return { id: payload.id, role: payload.role }
  } catch (e) {
    return { id: "", role: [UserRoleEnum.STUDENT] } // Return a default value to avoid TypeScript errors
  }
}
