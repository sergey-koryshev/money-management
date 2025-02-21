import { ExpensesMonthService } from '@services/expenses-month.service';
import { ExpensesHttpClientService } from '@http-clients/expenses-http-client.service';
import { CurrencyService } from '@services/currency.service';
import { Expense } from '@app/models/expense.model';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap, skip, tap, catchError, map } from 'rxjs/operators';
import { NgbDatepickerNavigateEvent, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Month } from '@app/models/month.model';
import { AddNewExpenseDialogComponent } from '../../components/add-new-expense-dialog/add-new-expense-dialog.component';
import { Price } from '@app/models/price.model';
import { ItemChangedEventArgs } from '../../components/expenses-table/expenses-table.model';
import { SharedFilterOptions } from '@app/models/enums/shared-filter.enum';
import { CreatedByFilterOptions } from '@app/models/enums/created-by-filter.enum';
import { ExpensesService } from '../../expenses.service';
import { StickyFilterDefinition, StickyFilterItem, StickyFilterType } from '@components/sticky-filters/sticky-filters.model';
import { ExpensesStickyFilterType } from '@app/models/enums/expenses-sticky-filter-type.enum';
import { defer, of } from 'rxjs';
import { CategoryHttpClient } from '@app/http-clients/category-http-client.service';
import { StoringExpensesStickyFilters } from './expenses-page.model';
import { emptyFilter, filtersStorageName } from "@app/constants";

const emptyCategoryFilter: StickyFilterItem<string | undefined> = {
  value: undefined,
  name: 'Empty Category'
}

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

  stickyFiltersDefinitions: Record<string, StickyFilterDefinition<any>> = {
    [ExpensesStickyFilterType.createdBy]: {
      type: StickyFilterType.list,
      name: ExpensesStickyFilterType.createdBy,
      displayName: ExpensesStickyFilterType.get(ExpensesStickyFilterType.createdBy).name,
      items: [...CreatedByFilterOptions.getAll()],
      defaultValue: emptyFilter,
      multiselect: false,
      allItem: emptyFilter
    },
    [ExpensesStickyFilterType.shared]: {
      type: StickyFilterType.list,
      name: ExpensesStickyFilterType.shared,
      displayName: ExpensesStickyFilterType.get(ExpensesStickyFilterType.shared).name,
      items: [...SharedFilterOptions.getAll()],
      defaultValue: emptyFilter,
      multiselect: false,
      allItem: emptyFilter
    },
    [ExpensesStickyFilterType.categories]: {
      type: StickyFilterType.dropdown,
      name: ExpensesStickyFilterType.categories,
      displayName: ExpensesStickyFilterType.get(ExpensesStickyFilterType.categories).name,
      source: defer(() => {
        return this.categoryHttpClient.getUniqueCategoryNames()
          .pipe(
            map((v) => [emptyCategoryFilter].concat(v.map((name) => ({
              name,
              value: name
            })))),
            catchError(() => of([]))
          );
      }),
      defaultValue: emptyFilter,
      multiselect: true,
      allItem: emptyFilter
    }
  };
  stickyFilters: StoringExpensesStickyFilters = {};

  constructor(
    private route: ActivatedRoute,
    private currencyService: CurrencyService,
    private expensesHttpClient: ExpensesHttpClientService,
    private modalService: NgbModal,
    private expensesMonthService: ExpensesMonthService,
    private expensesService: ExpensesService,
    private categoryHttpClient: CategoryHttpClient) {}

  ngOnInit(): void {
    this.selectedMonth = this.expensesMonthService.month;
    this.route.data.subscribe(data => this.populateData(data.expenses as Expense[]));
  }

  ngAfterViewInit(): void {
    this.currencyService.mainCurrency$
      .pipe(
        skip(1),
        switchMap(() => this.fetchData()))
      .subscribe();
    this.expensesMonthService.month$
      .pipe(
        skip(1),
        switchMap(() => this.fetchData()))
      .subscribe();
  }

  open() {
    const modalRef = this.modalService.open(AddNewExpenseDialogComponent);
    modalRef.closed.subscribe((addedExpanse: Expense) => {
      const date = new Date(addedExpanse.date);

      if (this.expensesMonthService.month.month == date.getMonth() + 1 &&
        this.expensesMonthService.month.year == date.getFullYear() &&
        this.expensesService.testExpenseAgainstFilter(this.stickyFilters, addedExpanse)) {
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

  private fetchData() {
    return this.expensesHttpClient.getExpenses(this.expensesMonthService.month, this.stickyFilters)
      .pipe(tap((data) => {
        this.populateData(data);
    }));
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

  onFiltersChanged(filters: StoringExpensesStickyFilters) {
    this.stickyFilters = filters;
    this.fetchData().subscribe();
  }

  protected readonly filtersStorageName = filtersStorageName;
}
