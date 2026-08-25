import { Expense } from '@app/models/expense.model';
import { StickyFilterItem } from "@components/sticky-filters/sticky-filters.model";

export function priceComparer(first: Expense, second: Expense) {
  const firstPrice = first.price ?? first.originalPrice!;
  const secondPrice = second.price ?? second.originalPrice!;

  return firstPrice.currency.name.localeCompare(secondPrice.currency.name) || firstPrice.amount - secondPrice.amount;
}

export function stickyFilterItemsComparer (a: StickyFilterItem<any>, b: StickyFilterItem<any>) {
  return a.value === b.value && a.name === b.name;
}
