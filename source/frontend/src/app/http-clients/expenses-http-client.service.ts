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
import { emptyFilter } from "@app/modules/expenses/pages/expenses-page/expenses-page.component";

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
      if (categoriesFilter != null && !categoriesFilter.some((c) => c.value == emptyFilter.value && c.name === emptyFilter.name)) {
        categoriesFilter.forEach((c) => {
          params = params.append('categoryName', c.value ?? "");
        });
      }
    }

    return this.baseHttpClient.get<Expense[]>('expenses', params);
  }

  addNewExpense(params: ChangeExpenseParams) {
    return this.baseHttpClient.post<Expense>('expenses', params);
  }

  getExistingNames(term: string) {
    if (term == null || term.length === 0) {
      return of([]);
    }

    return this.baseHttpClient.get<ExtendedExpenseName[]>('expenses/search/expenseNames', {
      term
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
