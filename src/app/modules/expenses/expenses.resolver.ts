import { ExpensesHttpClientService } from './../../http-clients/expenses-http-client.service';
import { Injectable } from '@angular/core';
import { Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Expense } from '@app/models/expense.model';
import { ExpensesMonthService } from '@app/services/expenses-month.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExpensesResolver implements Resolve<Expense[]> {
  constructor(private expensesHttpClient: ExpensesHttpClientService, private expensesMonthService: ExpensesMonthService) {}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Expense[]>  {
    return this.expensesHttpClient.getAllExpenses(this.expensesMonthService.month);
  }
}
