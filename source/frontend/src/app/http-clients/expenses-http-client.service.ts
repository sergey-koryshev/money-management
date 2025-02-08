import { ExpensesStickyFilterType } from './../modules/expenses/pages/expenses-page/expenses-filters.model';
import { Expense } from '@app/models/expense.model';
import { Injectable } from '@angular/core';
import { BaseHttpClientService } from './base-http-client.service';
import { ChangeExpenseParams, ExtendedExpenseName } from './expenses-http-client.model';
import { Month } from '@app/models/month.model';
import { of } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { StickyFilterItem } from '@app/models/sticky-filter.model';

@Injectable({
  providedIn: 'root'
})
export class ExpensesHttpClientService {

  constructor(private baseHttpClient: BaseHttpClientService) {}

  getExpenses(selectedMonth: Month, filters?: Record<string, StickyFilterItem<number | undefined>>) {
    let params = new HttpParams()
      .set('month', selectedMonth.month)
      .set('year', selectedMonth.year)
      .set('timeZone', Intl.DateTimeFormat().resolvedOptions().timeZone);

    if (filters != null) {
      if (filters[ExpensesStickyFilterType.createdBy] != null && filters[ExpensesStickyFilterType.createdBy].value != null) {
        params = params.set('createdById', filters[ExpensesStickyFilterType.createdBy].value!);
      }

      if (filters[ExpensesStickyFilterType.shared] != null && filters[ExpensesStickyFilterType.shared].value != null) {
        params = params.set('shared', !!filters[ExpensesStickyFilterType.shared].value);
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
