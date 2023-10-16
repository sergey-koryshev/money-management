import { Expense } from "./expense.model";
import { Price } from "./price.model";

export interface ExpensesView {
  expenses: Expense[];
  total?: Price;
}
