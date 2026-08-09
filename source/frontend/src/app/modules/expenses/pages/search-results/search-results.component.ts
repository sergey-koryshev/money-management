import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExpensesHttpClientService } from '@app/http-clients/expenses-http-client.service';
import { Expense } from '@app/models/expense.model';
import { CurrencyService } from '@app/services/currency.service';
import { ExpensesMonthService } from '@app/services/expenses-month.service';
import { skip, switchMap } from 'rxjs';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {

  expenses: Expense[];

  backLabel?: string;

  constructor(private route: ActivatedRoute, private currencyService: CurrencyService, private expensesHttpClient: ExpensesHttpClientService, expensesMonthService: ExpensesMonthService) {
    const selectedMonth = expensesMonthService.month;
    const selectedMonthName = new Date(selectedMonth.year, selectedMonth.month - 1, 1).toLocaleString('default', { month: 'long' });
    this.backLabel = `${selectedMonthName} ${selectedMonth.year}`;
  }

  ngOnInit(): void {
    this.route.data.subscribe((data) => this.expenses = data.expenses ?? []);
    this.currencyService.mainCurrency$
      .pipe(
        //we need to skip first item emitted by BehaviorSubject because we already get initial data from route resolver
        skip(1),
        switchMap(() => this.expensesHttpClient.searchExpenses(this.route.snapshot.queryParams['text'])))
      .subscribe((expenses) => this.expenses = expenses);
  }

}
