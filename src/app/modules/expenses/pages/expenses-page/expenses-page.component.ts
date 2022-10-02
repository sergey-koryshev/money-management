import { ExpensesHttpClientService } from '@http-clients/expenses-http-client.service';
import { CurrencyService } from '@services/currency.service';
import { Expense } from '@app/models/expense.model';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap, skip } from 'rxjs/operators';

@Component({
  selector: 'app-expenses-page',
  templateUrl: './expenses-page.component.html',
  styleUrls: ['./expenses-page.component.scss']
})
export class ExpensesPageComponent implements OnInit {

  expenses: Expense[];

  constructor(
    private route: ActivatedRoute, 
    private currencyService: CurrencyService, 
    private expensesHttpClient: ExpensesHttpClientService) { }

  ngOnInit(): void {
    this.route.data.subscribe((data) => this.expenses = data.expenses ?? []);
    this.currencyService.mainCurrency$
      .pipe(
        //we need to skip first item emitted by BehaviorSubject because we already get initial data from route resolver 
        skip(1),
        switchMap(() => this.expensesHttpClient.getAllExpenses()))
      .subscribe((expenses) => this.expenses = expenses);
  }

  onNewExpenseButtonClick() {
    // replace with real implementation
    const newExpense: Expense = {
      id: 100,
      date: new Date('2022-08-17'),
      item: 'New item',
      price: {
        amount: 90,
        currency: {
          id: 1,
          name: 'RSD',
          friendlyName: 'Serbian dinar',
          flagCode: 'rs'
        }
      }
    };
    this.addNewExpense(newExpense);
  }

   addNewExpense(expense: Expense) {
    this.expensesHttpClient.addNewExpense(expense)
      .subscribe((addedExpanse) => {
        this.expenses.push(addedExpanse);
      });
  }
}
