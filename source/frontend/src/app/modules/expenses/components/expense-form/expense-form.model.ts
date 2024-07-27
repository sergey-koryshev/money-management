import { Category } from "@app/models/category.model"
import { AmbiguousUser } from "@app/models/user.model"
import { NgbDate } from "@ng-bootstrap/ng-bootstrap"

export interface ExpenseForm {
  id?: number
  date: NgbDate
  item: string
  priceAmount: number
  currencyId: number
  category?: Category
  sharedWith?: AmbiguousUser[]
  description?: string
}
