import { ExpensesMonthService } from '@services/expenses-month.service';
import { ExpensesHttpClientService } from '@http-clients/expenses-http-client.service';
import { CurrencyService } from '@services/currency.service';
import { Expense } from '@app/models/expense.model';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap, skip } from 'rxjs/operators';
import { NgbDatepickerNavigateEvent, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Month } from '@app/models/month.model';
import { AddNewExpenseDialogComponent } from '../../components/add-new-expense-dialog/add-new-expense-dialog.component';
import { Price } from '@app/models/price.model';
import { ItemChangedEventArgs } from '../../components/expenses-table/expenses-table.model';
import { ExpenseViewType } from '@app/models/enums/expense-view-type.enum';

export const defaultViewTypeStorageName = 'default-view-type';

@Component({
  selector: 'app-expenses-page',
  templateUrl: './expenses-page.component.html',
  styleUrls: ['./expenses-page.component.scss']
})
export class ExpensesPageComponent implements OnInit, AfterViewInit {

  expenses: Expense[];
  selectedMonth: Month;
  totalAmount?: Price;
  viewType: ExpenseViewType;
  expenseViewTypes = ExpenseViewType

  viewTypeEnumToLabel = {
    [ExpenseViewType.All]: 'All',
    [ExpenseViewType.OnlyNotShared]: 'Only not shared',
    [ExpenseViewType.OnlyShared]: 'Only shared',
    [ExpenseViewType.CreatedByMe]: 'Created by me'
  }

  constructor(
    private route: ActivatedRoute,
    private currencyService: CurrencyService,
    private expensesHttpClient: ExpensesHttpClientService,
    private modalService: NgbModal,
    private expensesMonthService: ExpensesMonthService) {
      this.viewType = ExpenseViewType.All;

      const defaultViewType = localStorage.getItem(defaultViewTypeStorageName);

      if (defaultViewType != null) {
        this.viewType = Number(defaultViewType);
      }
    }

  ngOnInit(): void {
    this.selectedMonth = this.expensesMonthService.month;
    this.route.data.subscribe(data => this.populateData(data.expenses as Expense[]));
  }

  ngAfterViewInit(): void {
    this.currencyService.mainCurrency$
      .pipe(
        skip(1),
        switchMap(() => this.expensesHttpClient.getAllExpenses(this.expensesMonthService.month, this.viewType)))
      .subscribe(data => this.populateData(data));
    this.expensesMonthService.month$
      .pipe(
        skip(1),
        switchMap(() => this.expensesHttpClient.getAllExpenses(this.expensesMonthService.month, this.viewType)))
      .subscribe(data => this.populateData(data));
  }

  open() {
    const modalRef = this.modalService.open(AddNewExpenseDialogComponent);
    modalRef.closed.subscribe((addedExpanse: Expense) => {
      const date = new Date(addedExpanse.date);
      if (this.expensesMonthService.month.month == date.getMonth() + 1
        && this.expensesMonthService.month.year == date.getFullYear()
        && (this.viewType === ExpenseViewType.All
          || (this.viewType === ExpenseViewType.OnlyShared && addedExpanse.sharedWith.length > 0)
          || (this.viewType === ExpenseViewType.OnlyNotShared && addedExpanse.sharedWith.length === 0))) {
          this.expenses.push(addedExpanse);
          this.onItemChange({
            newValue: addedExpanse.exchangedPrice?.amount ?? addedExpanse.price.amount
          })
        }
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

  onViewTypeChanged(viewType: number) {
    this.expensesHttpClient.getAllExpenses(this.expensesMonthService.month, viewType)
      .subscribe(data => {
        localStorage.setItem(defaultViewTypeStorageName, String(viewType));
        this.viewType = viewType;
        this.populateData(data);
    });
  }

  private populateData(expenses: Expense[]) {
    this.expenses = expenses ?? [];
    const mainCurrency = this.currencyService.mainCurrency;
    if (mainCurrency) {
      this.totalAmount = {
        amount: expenses.reduce((sum, current) => sum + (current.exchangedPrice?.amount ?? current.price.amount), 0),
        currency: mainCurrency
      }
    } else {
      this.totalAmount = undefined;
    }
  }
}
