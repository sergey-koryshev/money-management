export interface AddExpenseParams {
  date: Date;
  item: string;
  priceAmount: number;
  currencyId: number;
  categoryId?: number;
}
