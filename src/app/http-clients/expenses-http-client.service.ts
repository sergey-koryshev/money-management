import { Expense } from '@app/models/expense.model';
import { Injectable } from '@angular/core';
import { BaseHttpClientService } from './base-http-client.service';

@Injectable({
  providedIn: 'root'
})
export class ExpensesHttpClientService {

  constructor(private baseHttpClient: BaseHttpClientService) { }

  getAllExpenses() {
    return this.baseHttpClient.get<Expense[]>('expenses');
  }

  addNewExpense(expense: Expense) {
    return this.baseHttpClient.post<Expense>('expenses', expense);
  }
}
