import { ExpensesHttpClientService } from '../../http-clients/expenses-http-client.service';
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Expense } from '@app/models/expense.model';
import { ExpensesMonthService } from '@app/services/expenses-month.service';
import { Observable } from 'rxjs';
import { defaultViewTypeStorageName } from './pages/expenses-page/expenses-page.component';
import { ExpenseViewType } from '@app/models/enums/expense-view-type.enum';

@Injectable()
export class ExpensesResolver implements Resolve<Expense[]> {
  constructor(private expensesHttpClient: ExpensesHttpClientService, private expensesMonthService: ExpensesMonthService) {}
  resolve(): Observable<Expense[]>  {
    const defaultViewType = localStorage.getItem(defaultViewTypeStorageName);
    return this.expensesHttpClient.getAllExpenses(this.expensesMonthService.month, defaultViewType == null ? ExpenseViewType.All : Number(defaultViewType));
  }
}
