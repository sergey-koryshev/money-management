import { Category } from './category.model'

export interface EditExpenseParams {
  id?: number
  date: Date
  item: string
  priceAmount: number
  currencyId: number
  category?: Category
  sharedWith?: number[]
}
