import { ExpensesStickyFilterType } from './pages/expenses-page/expenses-filters.model';
import { Injectable } from '@angular/core';
import { Expense } from '@app/models/expense.model';
import { emptyFilter } from './pages/expenses-page/expenses-page.component';
import { CreatedByFilterOptions } from '@app/models/enums/created-by-filter.enum';
import { SharedFilterOptions } from '@app/models/enums/shared-filter.enum';
import { UserService } from '@app/services/user.service';
import { StickyFilter } from '@app/models/sticky-filter.model';

@Injectable({
  providedIn: 'root'
})
export class ExpensesService {

  constructor(private userService: UserService) {}

  testExpenseAgainstFilter(stickyFilters: Record<string, StickyFilter<number | undefined>>, expense: Expense) {
    if ((stickyFilters[ExpensesStickyFilterType.shared] == null ||
      (stickyFilters[ExpensesStickyFilterType.shared].selectedValue?.value === emptyFilter.value ||
        (stickyFilters[ExpensesStickyFilterType.shared].selectedValue?.value === SharedFilterOptions.Yes && expense.permittedPersons.length > 0) ||
        (stickyFilters[ExpensesStickyFilterType.shared].selectedValue?.value === SharedFilterOptions.No && expense.permittedPersons.length === 0))) &&
      ((stickyFilters[ExpensesStickyFilterType.createdBy] == null ||
        (stickyFilters[ExpensesStickyFilterType.createdBy].selectedValue?.value === emptyFilter.value ||
          stickyFilters[ExpensesStickyFilterType.createdBy].selectedValue?.value === CreatedByFilterOptions.Me && expense.createdBy.id === this.userService.user?.id ||
            stickyFilters[ExpensesStickyFilterType.createdBy].selectedValue?.value === CreatedByFilterOptions.NotMe && expense.createdBy.id !== this.userService.user?.id)))) {
      return true;
    }

    return false;
  }
}
