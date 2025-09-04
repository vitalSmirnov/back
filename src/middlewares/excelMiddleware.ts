import { NextFunction, Response, Request } from "express"

export function setResponseExcelHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
  next()
}
