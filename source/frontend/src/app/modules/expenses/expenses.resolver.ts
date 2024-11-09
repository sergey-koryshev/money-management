import { ExpensesHttpClientService } from '@http-clients/expenses-http-client.service';
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Expense } from '@app/models/expense.model';
import { ExpensesMonthService } from '@app/services/expenses-month.service';
import { Observable } from 'rxjs';
import { filtersStorageName } from './pages/expenses-page/expenses-page.component';

@Injectable()
export class ExpensesResolver implements Resolve<Expense[]> {
  constructor(private expensesHttpClient: ExpensesHttpClientService, private expensesMonthService: ExpensesMonthService) {}
  resolve(): Observable<Expense[]>  {
    const savedFilters = localStorage.getItem(filtersStorageName);
    return this.expensesHttpClient.getExpenses(this.expensesMonthService.month, savedFilters == null ? null : JSON.parse(savedFilters));
  }
}
