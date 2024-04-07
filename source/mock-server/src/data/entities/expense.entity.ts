import { Identifier } from '../../models/identifier.model';

export interface ExpenseEntity extends Identifier {
  date: Date
  categoryId?: number
  item: string
  priceAmount: number
  priceCurrencyId: number
  tenant: string
  description?: string
}
