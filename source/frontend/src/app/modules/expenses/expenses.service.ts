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
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EditExpenseDialogComponent } from './components/edit-expense-dialog/edit-expense-dialog.component';
import { Month } from '@app/models/month.model';
import { catchError, map, of, skipWhile, switchMap } from 'rxjs';
import { ExpensesHttpClientService } from '@app/http-clients/expenses-http-client.service';
import { ItemChange } from './components/expenses-table/expenses-table.model';
import { ChangeExpenseParams } from '@app/http-clients/expenses-http-client.model';
import { AddNewExpenseDialogComponent } from './components/add-new-expense-dialog/add-new-expense-dialog.component';
import { DeleteExpenseDialogComponent } from './components/delete-expense-dialog/delete-expense-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ExpensesService {
  constructor(private userService: UserService, private modalService: NgbModal, private expensesHttpClient: ExpensesHttpClientService) { }

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
        (categoriesFilter.some((i) => i.value === expense.category.name)));
    }

    const namesFilter = stickyFilters[ExpensesStickyFilterType.names]
    if (namesFilter != null) {
      result = result && (namesFilter.some((i) => stickyFilterItemsComparer(i, emptyFilter)) ||
        (expense.category == null && namesFilter.some((i) => stickyFilterItemsComparer(i, emptyCategoryFilter))) ||
        (namesFilter.some((i) => i.value === expense.name)));
    }

    const currenciesFilter = stickyFilters[ExpensesStickyFilterType.currencies]
    if (currenciesFilter != null) {
      result = result && (currenciesFilter.some((i) => stickyFilterItemsComparer(i, emptyFilter)) ||
        (expense.category == null && currenciesFilter.some((i) => stickyFilterItemsComparer(i, emptyCategoryFilter))) ||
        (currenciesFilter.some((i) => i.value === (expense.originalPrice?.currency.id ?? expense.price.currency.id))));
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
    return (control: AbstractControl): ValidationErrors | null => {
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

  openEditExpenseDialog(item: Expense | undefined, currentExpenses: Expense[], selectedMonth?: Month, stickyFilters?: StoringExpensesStickyFilters) {
    if (item == null) {
      return of(undefined);
    }

    const modalRef = this.modalService.open(EditExpenseDialogComponent);
    const dialogInstance = modalRef.componentInstance as EditExpenseDialogComponent;
    dialogInstance.item = { ...item, date: new Date(item.date) };
    return dialogInstance.submitted
      .pipe(
        switchMap((params: ChangeExpenseParams) => this.expensesHttpClient.editExpense(item.id, params).pipe(catchError((err) => {
          dialogInstance.error = err.error.message ?? err.message;
          return of(undefined);
        }))),
        switchMap((updatedItem: Expense | undefined) => {
          if (updatedItem == null) {
            return of(undefined);
          }

          const change = this.adjustCurrentExpensesIfNeeded(item, updatedItem, selectedMonth, currentExpenses, stickyFilters);
          modalRef.close();
          return of(change);
        }));
  }

  openAddExpenseDialog(item: Expense | undefined, currentExpenses: Expense[], selectedMonth?: Month, stickyFilters?: StoringExpensesStickyFilters) {
    const modalRef = this.modalService.open(AddNewExpenseDialogComponent);
    const dialogInstance = modalRef.componentInstance as AddNewExpenseDialogComponent;

    if (item != null) {
      dialogInstance.item = { ...item, id: 0, date: new Date(item.date) };
    }

    return dialogInstance.submitted
      .pipe(
        switchMap((params: ChangeExpenseParams) => this.expensesHttpClient.addNewExpense(params).pipe(catchError((err) => {
          dialogInstance.error = err.error.message ?? err.message;
          return of(undefined);
        }))),
        switchMap((addedItem: Expense | undefined) => {
          if (addedItem == null) {
            return of(undefined);
          }
          const change = this.adjustCurrentExpensesIfNeeded(undefined, addedItem, selectedMonth, currentExpenses, stickyFilters);
          modalRef.close();
          return of(change);
        }));
  }

  openRemoveExpenseDialog(item: Expense | undefined, currentExpenses: Expense[]) {
    if (item == null) {
      return of(undefined);
    }

    const modalRef = this.modalService.open(DeleteExpenseDialogComponent);
    const dialogInstance = modalRef.componentInstance as DeleteExpenseDialogComponent;

    return dialogInstance.submitted
      .pipe(
        switchMap(() => this.expensesHttpClient.removeExpense(item.id).pipe(map(() => true), catchError((err) => {
          dialogInstance.error = err.error.message ?? err.message;
          return of(false);
        }))),
        switchMap((result) => {
          if (!result) {
            return of(undefined);
          }

          const indexOfItem = currentExpenses.indexOf(item);

          let change = undefined;

          if (indexOfItem >= 0) {
            currentExpenses.splice(indexOfItem, 1);

            change = {
              oldPrice: item.price
            };
          }

          modalRef.close();
          return of(change);
        }));
  }

  private adjustCurrentExpensesIfNeeded(originalItem: Expense | undefined, updatedItem: Expense, selectedMonth: Month | undefined, currentExpenses: Expense[], stickyFilters?: StoringExpensesStickyFilters): ItemChange {
    const indexOfItem = originalItem != null ? currentExpenses.findIndex((e) => e.id === originalItem.id) : -1;
    const date = new Date(updatedItem.date)
    const matchedFilters = (selectedMonth == null || ((selectedMonth.month != date.getMonth() + 1 && selectedMonth.year != date.getFullYear()))) ||
      (stickyFilters == null || this.testExpenseAgainstFilter(stickyFilters, updatedItem));

    if (indexOfItem >= 0 && !matchedFilters) {
      currentExpenses.splice(indexOfItem, 1);
    }

    if (matchedFilters) {
      if (indexOfItem === -1) {
        currentExpenses.push(updatedItem);
      } else {
        currentExpenses[indexOfItem] = updatedItem;
      }
    }

    if (originalItem == null) {
      return {
        newPrice: updatedItem.price
      };
    } else {
      return {
        oldPrice: originalItem.price,
        newPrice: updatedItem.price,
      };
    }
  }
}
