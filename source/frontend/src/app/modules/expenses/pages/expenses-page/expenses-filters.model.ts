import { CreatedByFilterOptions } from '@app/models/enums/created-by-filter.enum';
import { SharedFilterOptions } from '@app/models/enums/shared-filter.enum';
import { ListStickyFilter, StickyFilter, StickyFilterItem } from '@app/models/sticky-filter.model';

export interface ExpensesStickyFilters extends Record<string, StickyFilter<number | undefined>> {
  [ExpensesStickyFilterType.createdBy]: ListStickyFilter<CreatedByFilterOptions | undefined>
  [ExpensesStickyFilterType.shared]: ListStickyFilter<SharedFilterOptions | undefined>
}

export enum ExpensesStickyFilterType {
  createdBy = 'createdBy',
  shared = 'shared'
}

export interface StoredExpensesStickyFilters extends Record<string, StickyFilterItem<number | undefined>> {
  [ExpensesStickyFilterType.createdBy]: StickyFilterItem<CreatedByFilterOptions | undefined>
  [ExpensesStickyFilterType.shared]: StickyFilterItem<SharedFilterOptions | undefined>
}
