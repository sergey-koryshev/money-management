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
import { ExpensesFilters } from './expenses-filters.model';
import { ExtendedEnumItem } from '@app/models/enums/enums-base';
import { SharedFilterOptions } from '@app/models/enums/shared-filter.enum';
import { CreatedByFilterOptions } from '@app/models/enums/created-by-filter.enum';

export const emptyFilter: ExtendedEnumItem<any> = {
  value: undefined,
  name: 'All'
};
export const filtersStorageName = 'expenses-filters';
export const defaultFilters: ExpensesFilters = {
  createdBy: emptyFilter,
  shared: emptyFilter
};

@Component({
  selector: 'app-expenses-page',
  templateUrl: './expenses-page.component.html',
  styleUrls: ['./expenses-page.component.scss']
})
export class ExpensesPageComponent implements OnInit, AfterViewInit {

  readonly exchangeFaultedErrorMessage = 'Not all prices were converted successfully thus they were not taken into account in the counter.';

  expenses: Expense[];
  selectedMonth: Month;
  totalAmount?: Price;
  isExchangeFaulted: boolean = false;
  createdByFilterOptions: ExtendedEnumItem<CreatedByFilterOptions>[];
  sharedFilterOptions: ExtendedEnumItem<SharedFilterOptions>[];

  filters: ExpensesFilters = defaultFilters;

  constructor(
    private route: ActivatedRoute,
    private currencyService: CurrencyService,
    private expensesHttpClient: ExpensesHttpClientService,
    private modalService: NgbModal,
    private expensesMonthService: ExpensesMonthService) {
      this.createdByFilterOptions = [emptyFilter].concat(CreatedByFilterOptions.getAll());
      this.sharedFilterOptions = [emptyFilter].concat(SharedFilterOptions.getAll());

      const savedFilters = localStorage.getItem(filtersStorageName);

      if (savedFilters != null) {
        this.filters = JSON.parse(savedFilters);
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
        switchMap(() => this.expensesHttpClient.getExpenses(this.expensesMonthService.month, this.filters)))
      .subscribe(data => this.populateData(data));
    this.expensesMonthService.month$
      .pipe(
        skip(1),
        switchMap(() => this.expensesHttpClient.getExpenses(this.expensesMonthService.month, this.filters)))
      .subscribe(data => this.populateData(data));
  }

  open() {
    const modalRef = this.modalService.open(AddNewExpenseDialogComponent);
    modalRef.closed.subscribe((addedExpanse: Expense) => {
      const date = new Date(addedExpanse.date);
      if (this.expensesMonthService.month.month == date.getMonth() + 1
        && this.expensesMonthService.month.year == date.getFullYear()
        && (this.filters.shared.value === emptyFilter.value
          || (this.filters.shared.value === SharedFilterOptions.Yes && addedExpanse.permittedPersons.length > 0)
          || (this.filters.shared.value === SharedFilterOptions.No && addedExpanse.permittedPersons.length === 0))
        && (this.filters.createdBy.value === emptyFilter.value
          || this.filters.createdBy.value === CreatedByFilterOptions.Me)) {
          this.expenses.push(addedExpanse);
          this.onItemChange({
            newPrice: addedExpanse.price
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

    if (args.oldPrice && this.totalAmount.currency.id == args.oldPrice.currency.id) {
      this.totalAmount.amount = this.totalAmount.amount - args.oldPrice.amount;
    }

    if (args.newPrice && this.totalAmount.currency.id == args.newPrice.currency.id) {
      this.totalAmount.amount = this.totalAmount.amount + args.newPrice.amount;
    }

    this.isExchangeFaulted = this.expenses.some((e) => e.price.currency.id !== this.currencyService.mainCurrency?.id);
  }

  onFilterChanged(filterName: string, value: ExtendedEnumItem<any>) {
    this.filters[filterName] = value;

    this.expensesHttpClient.getExpenses(this.expensesMonthService.month, this.filters)
      .subscribe(data => {
        localStorage.setItem(filtersStorageName, JSON.stringify(this.filters));
        this.populateData(data);
    });
  }

  private populateData(expenses: Expense[]) {
    this.expenses = expenses ?? [];
    const mainCurrency = this.currencyService.mainCurrency;
    if (mainCurrency) {
      this.totalAmount = {
        amount: expenses.filter((e) => e.price.currency.id === this.currencyService.mainCurrency?.id).reduce((sum, current) => sum + current.price.amount, 0),
        currency: mainCurrency
      };
      this.isExchangeFaulted = expenses.some((e) => e.price.currency.id !== this.currencyService.mainCurrency?.id);
    } else {
      this.totalAmount = undefined;
      this.isExchangeFaulted = false;
    }
  }
}
