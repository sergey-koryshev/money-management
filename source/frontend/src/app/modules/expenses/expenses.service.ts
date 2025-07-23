import { Injectable } from '@angular/core';
import { Expense } from '@app/models/expense.model';
import { CreatedByFilterOptions } from '@app/models/enums/created-by-filter.enum';
import { SharedFilterOptions } from '@app/models/enums/shared-filter.enum';
import { UserService } from '@app/services/user.service';
import { ExpensesStickyFilterType } from '@app/models/enums/expenses-sticky-filter-type.enum';
import { StoringExpensesStickyFilters } from './pages/expenses-page/expenses-page.model';
import { emptyCategoryFilter, emptyFilter } from "@app/constants";
import { stickyFilterItemsComparer } from "@app/helpers/comparers.helper";
import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

@Injectable({
  providedIn: 'root'
})
export class ExpensesService {
  constructor(private userService: UserService) {}

  /**
   * Tests if the expense matches the sticky filters.
   * @param stickyFilters The sticky filters to test against.
   * @param expense The expense to test.
   * @returns True if the expense matches the sticky filters, false otherwise.
   */
  testExpenseAgainstFilter(stickyFilters: StoringExpensesStickyFilters, expense: Expense) {
    let result = true

    const createdByFilter = stickyFilters[ExpensesStickyFilterType.createdBy];
    if (createdByFilter != null) {
      result = result && (stickyFilterItemsComparer(createdByFilter, emptyFilter) ||
        createdByFilter.value === CreatedByFilterOptions.Me && expense.createdBy.id === this.userService.user?.id ||
        createdByFilter.value === CreatedByFilterOptions.NotMe && expense.createdBy.id !== this.userService.user?.id)
    }

    const sharedFilter = stickyFilters[ExpensesStickyFilterType.shared];
    if (sharedFilter != null) {
      result = result && (stickyFilterItemsComparer(sharedFilter, emptyFilter) ||
        (sharedFilter.value === SharedFilterOptions.Yes && expense.permittedPersons.length > 0) ||
        (sharedFilter.value === SharedFilterOptions.No && expense.permittedPersons.length === 0))
    }

    const categoriesFilter = stickyFilters[ExpensesStickyFilterType.categories]
    if (categoriesFilter != null) {
      result = result && (categoriesFilter.some((i) => stickyFilterItemsComparer(i, emptyFilter)) ||
        (expense.category == null && categoriesFilter.some((i) => stickyFilterItemsComparer(i, emptyCategoryFilter))) ||
        (categoriesFilter.some((i) => i.name === expense.category.name)));
    }

    const namesFilter = stickyFilters[ExpensesStickyFilterType.names]
    if (namesFilter != null) {
      result = result && (namesFilter.some((i) => stickyFilterItemsComparer(i, emptyFilter)) ||
        (expense.category == null && namesFilter.some((i) => stickyFilterItemsComparer(i, emptyCategoryFilter))) ||
        (namesFilter.some((i) => i.name === expense.category.name)));
    }

    return result;
  }

  /**
   * Normalizes a string or number to a valid number format.
   * @param value The value to normalize, can be a string or a number.
   * @returns The normalized number.
   * @throws Error if the value cannot be converted to a valid number.
   */
  normalizeNumberString(value: string | number) {
    if (typeof value === 'number') {
      return value;
    }

    let normalizedString = value.trim().replace(/,/g, '.');

    const parts = normalizedString.split('.');
    if (parts.length > 2) {
      const decimalPart = parts.pop();
      const integerPart = parts.join('');
      normalizedString = `${integerPart}.${decimalPart}`;
    }

    const finalNumber = Number(normalizedString);

    if (!isNaN(finalNumber)) {
      return finalNumber;
    } else {
      throw new Error(`Invalid number entered: ${value}`);
    }
  }

  numberValidator(): ValidatorFn {
    return (control:AbstractControl) : ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      try {
        this.normalizeNumberString(value);
        return null;
      } catch (error: any) {
        return { 'incorrectNumber': true }
      }
    }
  }
}
