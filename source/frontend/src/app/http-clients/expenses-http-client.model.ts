export interface ChangeExpenseParams {
  id?: number
  date: Date
  name: string
  description?: string
  priceAmount: number
  currencyId: number
  categoryName?: string
  permittedPersonsIds?: number[]
}

export interface ExtendedExpenseName {
  name: string
  categoryName?: string
}
