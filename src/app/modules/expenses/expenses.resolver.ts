import { ExpensesHttpClientService } from './../../http-clients/expenses-http-client.service';
import { Injectable } from '@angular/core';
import { Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { ExpensesView } from '@app/models/expenses-view.model';
import { ExpensesMonthService } from '@app/services/expenses-month.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExpensesResolver implements Resolve<ExpensesView> {
  constructor(private expensesHttpClient: ExpensesHttpClientService, private expensesMonthService: ExpensesMonthService) {}
  resolve(): Observable<ExpensesView>  {
    return this.expensesHttpClient.getExpensesView(this.expensesMonthService.month);
  }
}
