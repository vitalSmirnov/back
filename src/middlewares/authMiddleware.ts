import { type Request, type Response, type NextFunction } from "express"
import { UserRoleEnum } from "../domain/models/UserRoleEnum.js"
import { getRoleFromHeaders } from "../lib/utils/getRoleFromHeader.js"

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  const decoded = getRoleFromHeaders(req.headers.authorization!)

  if (decoded && decoded.role === UserRoleEnum.ADMIN) return next()
  return res.status(403).json({ error: "Admin only" })
}

export function isUser(req: Request, res: Response, next: NextFunction) {
  const decoded = getRoleFromHeaders(req.headers.authorization!)

  if (decoded && decoded.role === UserRoleEnum.STUDENT) return next()
  return res.status(403).json({ error: "Student only" })
}

export function isProfessor(req: Request, res: Response, next: NextFunction) {
  const decoded = getRoleFromHeaders(req.headers.authorization!)

  if (decoded && decoded.role === UserRoleEnum.PROFESSOR) return next()
  return res.status(403).json({ error: "Professor only" })
}
export function isNotStudent(req: Request, res: Response, next: NextFunction) {
  const decoded = getRoleFromHeaders(req.headers.authorization!)

  if (decoded && (decoded.role === UserRoleEnum.PROFESSOR || decoded.role === UserRoleEnum.ADMIN)) return next()
  return res.status(403).json({ error: "Professor only" })
}
