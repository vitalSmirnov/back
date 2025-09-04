import { Prove } from "./prove.js"
import { ReasonEnum } from "./ReasonEnum.js"
import { StatusEnum } from "./StatusEnum.js"

export interface Ticket {
  id: string
  name: string
  description: string
  startDate: Date
  endDate: Date
  reason: ReasonEnum
  status: StatusEnum
  prooves: Prove[]
}
