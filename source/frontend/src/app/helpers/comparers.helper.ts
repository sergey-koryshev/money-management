import { Expense } from '@app/models/expense.model';
import { StickyFilterItem } from "@components/sticky-filters/sticky-filters.model";

export function priceComparer(first: Expense, second: Expense) {
  const firstPrice = first.originalPrice ?? first.price;
  const secondPrice = second.originalPrice ?? second.price;

  return firstPrice.amount < secondPrice.amount
    ? -1
    : firstPrice.amount > secondPrice.amount
      ? 1
      : 0;
}

export function stickyFilterItemsComparer (a: StickyFilterItem<any>, b: StickyFilterItem<any>) {
  return a.value === b.value && a.name === b.name;
}
