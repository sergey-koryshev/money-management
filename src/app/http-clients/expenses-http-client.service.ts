import { Expense } from '@app/models/expense.model';
import { Injectable } from '@angular/core';
import { BaseHttpClientService } from './base-http-client.service';
import { AddExpenseParams, ItemWithCategory } from './expenses-http-client.model';
import { Month } from '@app/models/month.model';

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
    return this.baseHttpClient.post<ItemWithCategory[]>('expenses/items', searchEntry, undefined, {
      'Content-Type': 'text/plain'
    })
  }

  removeExpense(id: number) {
    return this.baseHttpClient.delete(`expenses/${id}`);
  }
}
