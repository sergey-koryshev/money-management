import { Expense } from '@app/models/expense.model';

export function priceComparer(first: Expense, second: Expense) {
  const firstPrice = first.exchangedPrice ?? first.price;
  const secondPrice = second.exchangedPrice ?? second.price;

  return firstPrice.amount < secondPrice.amount
    ? -1
    : firstPrice.amount > secondPrice.amount
    ? 1
    : 0;
}
