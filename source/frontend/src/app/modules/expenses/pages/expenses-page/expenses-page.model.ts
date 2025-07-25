import { ExpensesStickyFilterType } from "@app/models/enums/expenses-sticky-filter-type.enum";
import {
  StickyFilterItem,
  StoringStickyFilters
} from "@components/sticky-filters/sticky-filters.model";

export interface StoringExpensesStickyFilters extends StoringStickyFilters {
  [ExpensesStickyFilterType.createdBy]?: StickyFilterItem<number | undefined>
  [ExpensesStickyFilterType.shared]?: StickyFilterItem<number | undefined>
  [ExpensesStickyFilterType.categories]?: StickyFilterItem<string | undefined>[]
  [ExpensesStickyFilterType.names]?: StickyFilterItem<string | undefined>[]
  [ExpensesStickyFilterType.currencies]?: StickyFilterItem<number | undefined>[]
}
