export interface ChangeExpenseParams {
  date: Date
  name: string
  description?: string
  priceAmount: number
  currencyId: number
  categoryName?: string
  permittedPersonsIds?: number[]
  timeZone?: string
}

export interface ExtendedExpenseName {
  name: string
  categoryName?: string
}
