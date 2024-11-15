import { Expense } from '@app/models/expense.model';
import { Injectable } from '@angular/core';
import { BaseHttpClientService } from './base-http-client.service';
import { ChangeExpenseParams, ExtendedExpenseName } from './expenses-http-client.model';
import { Month } from '@app/models/month.model';
import { of } from 'rxjs';
import { defaultFilters } from '@app/modules/expenses/pages/expenses-page/expenses-page.component';
import { ExpensesFilters } from '@app/modules/expenses/pages/expenses-page/expenses-filters.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ExpensesHttpClientService {

  constructor(private baseHttpClient: BaseHttpClientService) {}

  getExpenses(selectedMonth: Month, filters?: ExpensesFilters) {
    const additionalFilters = filters ?? defaultFilters

    let params = new HttpParams()
      .set('month', selectedMonth.month)
      .set('year', selectedMonth.year)
      .set('timeZone', Intl.DateTimeFormat().resolvedOptions().timeZone);

    if (additionalFilters.createdBy.value != null) {
      params = params.set('createdById', additionalFilters.createdBy.value as number);
    }

    if (additionalFilters.shared.value != null) {
      params = params.set('shared', !!additionalFilters.shared.value);
    }

    return this.baseHttpClient.get<Expense[]>('expenses', params);
  }

  addNewExpense(params: ChangeExpenseParams) {
    params.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
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
    params.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return this.baseHttpClient.put<Expense>(`expenses/${id}`, params)
  }

  searchExpenses(term: string) {
    if (term == null || term.length === 0) {
      return of([]);
    }

    return this.baseHttpClient.get<Expense[]>('expenses/search', {
      searchingTerm: term,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    })
  }
}
