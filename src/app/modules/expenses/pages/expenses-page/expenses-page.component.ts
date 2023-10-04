import { ExpensesMonthService } from './../../../../services/expenses-month.service';
import { ExpensesHttpClientService } from '@http-clients/expenses-http-client.service';
import { CurrencyService } from '@services/currency.service';
import { Expense } from '@app/models/expense.model';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap, skip } from 'rxjs/operators';
import { NgbDate, NgbDatepickerNavigateEvent, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddExpenseParams } from '@app/http-clients/expenses-http-client.model';
import { Month } from '@app/models/month.model';
import { AddNewExpenseDialogComponent } from '../../components/add-new-expense-dialog/add-new-expense-dialog.component';

@Component({
  selector: 'app-expenses-page',
  templateUrl: './expenses-page.component.html',
  styleUrls: ['./expenses-page.component.scss']
})
export class ExpensesPageComponent implements OnInit {

  expenses: Expense[];
  selectedMonth: Month;

  constructor(
    private route: ActivatedRoute,
    private currencyService: CurrencyService,
    private expensesHttpClient: ExpensesHttpClientService,
    private modalService: NgbModal,
    private expensesMonthService: ExpensesMonthService) { }

  ngOnInit(): void {
    this.selectedMonth = this.expensesMonthService.getMonth();
    this.route.data.subscribe((data) => this.expenses = data.expenses ?? []);
    this.currencyService.mainCurrency$
      .pipe(
        //we need to skip first item emitted by BehaviorSubject because we already get initial data from route resolver
        skip(1),
        switchMap(() => this.expensesHttpClient.getAllExpenses(this.expensesMonthService.month)))
      .subscribe((expenses) => this.expenses = expenses);
    this.expensesMonthService.month$
      .pipe(
        //we need to skip first item emitted by BehaviorSubject because we already get initial data from route resolver
        skip(1),
        switchMap(() => this.expensesHttpClient.getAllExpenses(this.expensesMonthService.month)))
      .subscribe((expenses) => this.expenses = expenses);
  }

  addNewExpense(expense: AddExpenseParams) {
    this.expensesHttpClient.addNewExpense(expense)
      .subscribe((addedExpanse) => {
        const date = new Date(addedExpanse.date)
        if (this.expensesMonthService.month.month == date.getMonth() + 1
          && this.expensesMonthService.month.year == date.getFullYear()) {
            this.expenses.push(addedExpanse);
          }
      });
  }

  open() {
    const modalRef = this.modalService.open(AddNewExpenseDialogComponent);
    modalRef.closed.subscribe(({date, priceAmount, ...restParams}) => {
      this.addNewExpense({
        date: new Date(date.year, date.month - 1, date.day),
        priceAmount: Number(priceAmount),
        ...restParams
      });
    });
  }

  onMonthChange(value: NgbDatepickerNavigateEvent) {
    this.expensesMonthService.month$.next({
      month: value.next.month,
      year: value.next.year
    });
  }
}
