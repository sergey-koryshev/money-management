import { Injectable } from '@angular/core';
import { Expense } from '@app/models/expense.model';
import { emptyFilter } from './pages/expenses-page/expenses-page.component';
import { CreatedByFilterOptions } from '@app/models/enums/created-by-filter.enum';
import { SharedFilterOptions } from '@app/models/enums/shared-filter.enum';
import { UserService } from '@app/services/user.service';
import { ExpensesStickyFilterType } from '@app/models/enums/expenses-sticky-filter-type.enum';
import { StoringExpensesStickyFilters} from './pages/expenses-page/expenses-page.model';

@Injectable({
  providedIn: 'root'
})
export class ExpensesService {

  constructor(private userService: UserService) {}

  testExpenseAgainstFilter(stickyFilters: StoringExpensesStickyFilters, expense: Expense) {
    let result = true

    const createdByFilter = stickyFilters[ExpensesStickyFilterType.createdBy];
    if (createdByFilter != null) {
      result = result && (createdByFilter.value === emptyFilter.value ||
        createdByFilter.value === CreatedByFilterOptions.Me && expense.createdBy.id === this.userService.user?.id ||
        createdByFilter.value === CreatedByFilterOptions.NotMe && expense.createdBy.id !== this.userService.user?.id)
    }

    const sharedFilter = stickyFilters[ExpensesStickyFilterType.shared];
    if (sharedFilter != null) {
      result = result && (sharedFilter.value === emptyFilter.value ||
        (sharedFilter.value === SharedFilterOptions.Yes && expense.permittedPersons.length > 0) ||
        (sharedFilter.value === SharedFilterOptions.No && expense.permittedPersons.length === 0))
    }

    const categoriesFilter = stickyFilters[ExpensesStickyFilterType.categories]
    if (categoriesFilter != null) {
      result = result && (categoriesFilter.some((i) => i.value === emptyFilter.value) ||
        categoriesFilter.some((i) => i.value === expense.category.name))
    }

    return result;
  }
}
