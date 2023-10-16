import { Expense } from '@app/models/expense.model';
import { Injectable } from '@angular/core';
import { BaseHttpClientService } from './base-http-client.service';
import { AddExpenseParams, ItemWithCategory } from './expenses-http-client.model';
import { Month } from '@app/models/month.model';
import { of } from 'rxjs';
import { ExpensesView } from '@app/models/expenses-view.model';

@Injectable({
  providedIn: 'root'
})
export class ExpensesHttpClientService {

  constructor(private baseHttpClient: BaseHttpClientService) { }

  getAllExpenses(selectedMonth: Month) {
    return this.baseHttpClient.get<Expense[]>('expenses', {
      "month": selectedMonth.month,
      "year": selectedMonth.year
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

  editExpense(item: Expense) {
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

  getExpensesView(selectedMonth: Month) {
    return this.baseHttpClient.get<ExpensesView>('expenses/view', {
      "month": selectedMonth.month,
      "year": selectedMonth.year
    });
  }}
