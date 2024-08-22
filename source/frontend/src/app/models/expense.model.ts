import { Category } from "./category.model";
import { Price } from "./price.model";
import { AmbiguousUser } from "./user.model";

export interface Expense {
  id: number
  date: Date
  category: Category
  name: string
  description?: string
  price: Price
  originalPrice?: Price
  permittedPersons: AmbiguousUser[]
  createdBy: AmbiguousUser
  isShared: boolean
  canBeEdited: boolean
}
