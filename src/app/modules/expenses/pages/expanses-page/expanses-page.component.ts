import { ExpensesHttpClientService } from '@http-clients/expenses-http-client.service';
import { CurrencyService } from '@services/currency.service';
import { Expense } from '@app/models/expense.model';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap, skip } from 'rxjs/operators';

@Component({
  selector: 'app-expanses-page',
  templateUrl: './expanses-page.component.html',
  styleUrls: ['./expanses-page.component.scss']
})
export class ExpansesPageComponent implements OnInit {

  expenses: Expense[];

  constructor(
    private route: ActivatedRoute, 
    private currencyService: CurrencyService, 
    private expensesHttpClient: ExpensesHttpClientService) { }

  ngOnInit(): void {
    this.route.data.subscribe((data) => this.expenses = data.expenses ?? []);
    this.currencyService.mainCurrency$
      .pipe(
        skip(1),
        switchMap(() => this.expensesHttpClient.getAllExpenses()))
      .subscribe((expenses) => this.expenses = expenses);
  }
}
