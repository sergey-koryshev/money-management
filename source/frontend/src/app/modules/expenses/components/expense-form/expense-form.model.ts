import { AmbiguousUser } from "@app/models/user.model"
import { NgbDate } from "@ng-bootstrap/ng-bootstrap"

export interface ExpenseForm {
  id: number
  date: NgbDate
  name: string
  description?: string
  priceAmount: number
  currencyId: number
  categoryName?: string
  permittedPersons: AmbiguousUser[]
}
