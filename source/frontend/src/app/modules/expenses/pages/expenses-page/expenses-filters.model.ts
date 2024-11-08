import { CreatedByFilterOptions } from '@app/models/enums/created-by-filter.enum';
import { ExtendedEnumItem } from '@app/models/enums/enums-base';
import { SharedFilterOptions } from '@app/models/enums/shared-filter.enum';
import { TableFiltersCollection } from '@app/models/table-filters-collection.model';

export interface ExpensesFilters extends TableFiltersCollection {
  createdBy: ExtendedEnumItem<CreatedByFilterOptions>
  shared: ExtendedEnumItem<SharedFilterOptions>
}
