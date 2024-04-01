import { Category } from "@app/models/category.model";

export interface AddExpenseParams {
  date: Date;
  item: string;
  priceAmount: number
  currencyId: number
  category?: Category
  sharedWith?: number[]
  description?: string
}

export interface EditExpenseParams {
  id?: number
  date: Date
  item: string
  priceAmount: number
  currencyId: number
  category?: Category
  sharedWith?: number[]
  description?: string
}

export interface ItemWithCategory {
  item: string
  categoryId?: number
  isNew?: boolean
}
