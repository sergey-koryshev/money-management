import { Expense } from '@app/models/expense.model';
import { Injectable } from '@angular/core';
import { BaseHttpClientService } from './base-http-client.service';
import { ChangeExpenseParams, ExtendedExpenseName } from './expenses-http-client.model';
import { Month } from '@app/models/month.model';
import { of } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ExpensesStickyFilterType } from '@app/models/enums/expenses-sticky-filter-type.enum';
import {
  StoringExpensesStickyFilters
} from '@app/modules/expenses/pages/expenses-page/expenses-page.model';
import { emptyFilter } from "@app/constants";
import { stickyFilterItemsComparer } from "@app/helpers/comparers.helper";

@Injectable({
  providedIn: 'root'
})
export class ExpensesHttpClientService {

  constructor(private baseHttpClient: BaseHttpClientService) {}

  getExpenses(selectedMonth: Month, filters?: StoringExpensesStickyFilters) {
    let params = new HttpParams()
      .set('month', selectedMonth.month)
      .set('year', selectedMonth.year)
      .set('timeZone', Intl.DateTimeFormat().resolvedOptions().timeZone);

    if (filters != null) {
      const createdByFilter = filters[ExpensesStickyFilterType.createdBy];
      if (createdByFilter != null && createdByFilter.value != null) {
        params = params.set('createdById', createdByFilter.value!);
      }

      const sharedFilter = filters[ExpensesStickyFilterType.shared];
      if (sharedFilter != null && sharedFilter.value != null) {
        params = params.set('shared', !!sharedFilter.value);
      }

      const categoriesFilter = filters[ExpensesStickyFilterType.categories];
      if (categoriesFilter != null && !categoriesFilter.some((c) => stickyFilterItemsComparer(c, emptyFilter))) {
        categoriesFilter.forEach((c) => {
          params = params.append('categoryName', c.value ?? "");
        });
      }

      const namesFilter = filters[ExpensesStickyFilterType.names];
      if (namesFilter != null && !namesFilter.some((c) => stickyFilterItemsComparer(c, emptyFilter))) {
        namesFilter.forEach((c) => {
          params = params.append('name', c.value ?? "");
        });
      }

      const currenciesFilter = filters[ExpensesStickyFilterType.currencies];
      if (currenciesFilter != null && !currenciesFilter.some((c) => stickyFilterItemsComparer(c, emptyFilter))) {
        currenciesFilter.forEach((c) => {
          if (c.value != null) {
            params = params.append('currencyId', c.value);
          }
        });
      }
    }

    return this.baseHttpClient.get<Expense[]>('expenses', params);
  }

  addNewExpense(params: ChangeExpenseParams) {
    return this.baseHttpClient.post<Expense>('expenses', params);
  }

  getExistingNames(term: string, ignoreCategory: boolean) {
    if (term == null || term.length === 0) {
      return of([]);
    }

    return this.baseHttpClient.get<ExtendedExpenseName[]>('expenses/search/expenseNames', {
      term,
      ignoreCategory
    });
  }

  removeExpense(id: number) {
    return this.baseHttpClient.delete<void>(`expenses/${id}`);
  }

  editExpense(id: number, params: ChangeExpenseParams) {
    return this.baseHttpClient.put<Expense>(`expenses/${id}`, params)
  }

  searchExpenses(term: string) {
    if (term == null || term.length === 0) {
      return of([]);
    }

    return this.baseHttpClient.get<Expense[]>('expenses/search', {
      searchingTerm: term
    })
  }
}
