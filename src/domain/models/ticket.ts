import { Prove } from "./prove.js"
import { ReasonEnum } from "./ReasonEnum.js"
import { StatusEnum } from "./StatusEnum.js"

export interface Ticket {
  id: string
  name: string
  description: string
  startDate: string
  endDate?: string
  reason: ReasonEnum
  status: StatusEnum
  userId: string
  prooves: Prove[]
}
