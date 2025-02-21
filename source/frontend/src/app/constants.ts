import { Currency } from "@models/currency.model";
import { StickyFilterItem } from "@components/sticky-filters/sticky-filters.model";

export const emptyMainCurrency: Currency = {
    id: 9999,
    name: "Not selected",
    friendlyName: "Main currency is not selected",
    flagCode: "xx"
}

export const emptyTableData: string = "-";

export const emptyFilter: StickyFilterItem<number | undefined> = {
  value: undefined,
  name: 'All'
};

export const filtersStorageName = 'expenses-sticky-filters';
