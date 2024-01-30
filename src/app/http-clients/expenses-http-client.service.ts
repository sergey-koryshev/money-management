import { Expense } from '@app/models/expense.model';
import { Injectable } from '@angular/core';
import { BaseHttpClientService } from './base-http-client.service';
import { AddExpenseParams, EditExpenseParams, ItemWithCategory } from './expenses-http-client.model';
import { Month } from '@app/models/month.model';
import { of } from 'rxjs';
import { ExpenseViewType } from '@app/models/enums/expense-view-type.enum';

@Injectable({
  providedIn: 'root'
})
export class ExpensesHttpClientService {

  constructor(private baseHttpClient: BaseHttpClientService) { }

  getAllExpenses(selectedMonth: Month, viewType?: number) {
    return this.baseHttpClient.get<Expense[]>('expenses', {
      month: selectedMonth.month,
      year: selectedMonth.year,
      viewType: viewType == null ? ExpenseViewType.All : viewType
    });
  }

  addNewExpense(expense: AddExpenseParams) {
    return this.baseHttpClient.post<Expense>('expenses', expense);
  }

  getExistingItems(searchEntry: string) {
    if (searchEntry == null || searchEntry.length === 0) {
      return of([]);
    }

    return this.baseHttpClient.post<ItemWithCategory[]>('expenses/items', searchEntry, undefined, {
      'Content-Type': 'text/plain'
    })
  }

  removeExpense(id: number) {
    return this.baseHttpClient.delete<Expense>(`expenses/${id}`);
  }

  editExpense(item: EditExpenseParams) {
    return this.baseHttpClient.put<Expense>(`expenses`, item)
  }

  searchExpenses(searchEntry: string) {
    if (searchEntry == null || searchEntry.length === 0) {
      return of([]);
    }

    return this.baseHttpClient.post<Expense[]>('expenses/search', searchEntry, undefined, {
      'Content-Type': 'text/plain'
    })
  }
}
