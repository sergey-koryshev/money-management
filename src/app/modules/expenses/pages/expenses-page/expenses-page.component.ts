import { ExpensesMonthService } from '@services/expenses-month.service';
import { ExpensesHttpClientService } from '@http-clients/expenses-http-client.service';
import { CurrencyService } from '@services/currency.service';
import { Expense } from '@app/models/expense.model';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap, skip } from 'rxjs/operators';
import { NgbDatepickerNavigateEvent, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddExpenseParams } from '@app/http-clients/expenses-http-client.model';
import { Month } from '@app/models/month.model';
import { AddNewExpenseDialogComponent } from '../../components/add-new-expense-dialog/add-new-expense-dialog.component';
import { Price } from '@app/models/price.model';
import { ExpensesView } from '@app/models/expenses-view.model';
import { ItemChangedEventArgs } from '../../components/expenses-table/expenses-table.model';
import { forkJoin, merge, zip } from 'rxjs';

@Component({
  selector: 'app-expenses-page',
  templateUrl: './expenses-page.component.html',
  styleUrls: ['./expenses-page.component.scss']
})
export class ExpensesPageComponent implements OnInit, AfterViewInit {

  expenses: Expense[];
  selectedMonth: Month;
  totalAmount?: Price;

  constructor(
    private route: ActivatedRoute,
    private currencyService: CurrencyService,
    private expensesHttpClient: ExpensesHttpClientService,
    private modalService: NgbModal,
    private expensesMonthService: ExpensesMonthService) { }

  ngOnInit(): void {
    this.selectedMonth = this.expensesMonthService.month;
    this.route.data.subscribe(data => this.populateData(data.expensesView as ExpensesView));
  }

  ngAfterViewInit(): void {
    this.currencyService.mainCurrency$
      .pipe(
        skip(1),
        switchMap(() => this.expensesHttpClient.getExpensesView(this.expensesMonthService.month)))
      .subscribe(data => this.populateData(data));
    this.expensesMonthService.month$
      .pipe(
        skip(1),
        switchMap(() => this.expensesHttpClient.getExpensesView(this.expensesMonthService.month)))
      .subscribe(data => this.populateData(data));
  }

  addNewExpense(expense: AddExpenseParams) {
    this.expensesHttpClient.addNewExpense(expense)
      .subscribe((addedExpanse) => {
        const date = new Date(addedExpanse.date)
        if (this.expensesMonthService.month.month == date.getMonth() + 1
          && this.expensesMonthService.month.year == date.getFullYear()) {
            this.expenses.push(addedExpanse);
            this.onItemChange({
              newValue: addedExpanse.exchangedPrice?.amount ?? addedExpanse.price.amount
            })
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
    this.selectedMonth = this.expensesMonthService.month;
  }

  onItemChange(args: ItemChangedEventArgs) {
    if (!this.totalAmount) {
      return;
    }

    if (args.oldValue) {
      this.totalAmount.amount = this.totalAmount.amount - args.oldValue;
    }

    if (args.newValue) {
      this.totalAmount.amount = this.totalAmount.amount + args.newValue;
    }
  }

  private populateData(view: ExpensesView) {
    this.expenses = view.expenses ?? [];
    this.totalAmount = view.total;
  }
}
