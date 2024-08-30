import { Expense } from '@app/models/expense.model';

export function priceComparer(first: Expense, second: Expense) {
  const firstPrice = first.originalPrice ?? first.price;
  const secondPrice = second.originalPrice ?? second.price;

  return firstPrice.amount < secondPrice.amount
    ? -1
    : firstPrice.amount > secondPrice.amount
      ? 1
      : 0;
}
