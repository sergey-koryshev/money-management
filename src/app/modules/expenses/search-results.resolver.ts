import { ExpensesHttpClientService } from './../../http-clients/expenses-http-client.service';
import { Injectable } from '@angular/core';
import { Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Expense } from '@app/models/expense.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchResultsResolver implements Resolve<Expense[]> {
  constructor(private expensesHttpClient: ExpensesHttpClientService) {}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Expense[]> {
    return this.expensesHttpClient.searchExpenses(route.queryParams.text);
  }
}
