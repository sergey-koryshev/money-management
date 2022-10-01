import { ExpensesHttpClientService } from './../../http-clients/expenses-http-client.service';
import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Expense } from '@app/models/expense.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExpensesResolver implements Resolve<Expense[]> {
  constructor(private expensesHttpClient: ExpensesHttpClientService) {}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Expense[]>  {
    return this.expensesHttpClient.getAllExpenses();
  }
}
