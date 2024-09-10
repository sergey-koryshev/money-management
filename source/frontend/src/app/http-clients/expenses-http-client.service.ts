import { Expense } from '@app/models/expense.model';
import { Injectable } from '@angular/core';
import { BaseHttpClientService } from './base-http-client.service';
import { ChangeExpenseParams, ExtendedExpenseName } from './expenses-http-client.model';
import { Month } from '@app/models/month.model';
import { of } from 'rxjs';
import { ExpenseViewType } from '@app/models/enums/expense-view-type.enum';

@Injectable({
  providedIn: 'root'
})
export class ExpensesHttpClientService {

  constructor(private baseHttpClient: BaseHttpClientService) {}

  getExpenses(selectedMonth: Month, viewType?: number) {
    return this.baseHttpClient.get<Expense[]>('expenses', {
      month: selectedMonth.month,
      year: selectedMonth.year,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      viewType: viewType == null ? ExpenseViewType.All : viewType
    });
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
