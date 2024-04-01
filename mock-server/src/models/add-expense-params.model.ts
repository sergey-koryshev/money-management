import { Category } from './category.model';

export interface AddExpenseParams {
  date: Date
  item: string
  priceAmount: number
  currencyId: number
  category?: Category
  sharedWith?: number[]
  description?: string
}
