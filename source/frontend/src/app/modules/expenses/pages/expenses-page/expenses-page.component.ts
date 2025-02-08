import { ExpensesMonthService } from '@services/expenses-month.service';
import { ExpensesHttpClientService } from '@http-clients/expenses-http-client.service';
import { CurrencyService } from '@services/currency.service';
import { Expense } from '@app/models/expense.model';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap, skip, tap } from 'rxjs/operators';
import { NgbDatepickerNavigateEvent, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Month } from '@app/models/month.model';
import { AddNewExpenseDialogComponent } from '../../components/add-new-expense-dialog/add-new-expense-dialog.component';
import { Price } from '@app/models/price.model';
import { ItemChangedEventArgs } from '../../components/expenses-table/expenses-table.model';
import { SharedFilterOptions } from '@app/models/enums/shared-filter.enum';
import { CreatedByFilterOptions } from '@app/models/enums/created-by-filter.enum';
import { ExpensesStickyFilterType } from './expenses-filters.model';
import { ExpensesService } from '../../expenses.service';
import { KeyValue } from '@angular/common';
import { StickyFilter, StickyFilterDefinition, StickyFilterItem, StickyFilterType } from '@app/models/sticky-filter.model';

export const emptyFilter: StickyFilterItem<number | undefined> = {
  value: undefined,
  name: 'All'
};
export const filtersStorageName = 'expenses-sticky-filters';

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

  stickyFiltersDefinitions: Record<string, StickyFilterDefinition<number | undefined>> = {
    [ExpensesStickyFilterType.createdBy]: {
      type: StickyFilterType.list,
      name: ExpensesStickyFilterType.createdBy,
      displayName: 'Created By',
      items: [emptyFilter].concat(CreatedByFilterOptions.getAll()),
      defaultValue: emptyFilter,
    },
    [ExpensesStickyFilterType.shared]: {
      type: StickyFilterType.list,
      name: ExpensesStickyFilterType.shared,
      displayName: 'Shared',
      items: [emptyFilter].concat(SharedFilterOptions.getAll()),
      defaultValue: emptyFilter,
    }
  };

  stickyFilterType = StickyFilterType;
  stickyFilters: Record<string, StickyFilter<number | undefined>> = {};

  get filters(): Record<string, StickyFilterItem<number | undefined>> {
    const filtersToStore: Record<string, StickyFilterItem<number | undefined>> = {};

    Object.keys(this.stickyFilters).forEach((filter) => {
      filtersToStore[filter] = this.stickyFilters[filter].selectedValue
    });

    return filtersToStore;
  }

  originalOrder = (a: KeyValue<string,any>, b: KeyValue<string,any>): number => {
    return 0;
  }

  constructor(
    private route: ActivatedRoute,
    private currencyService: CurrencyService,
    private expensesHttpClient: ExpensesHttpClientService,
    private modalService: NgbModal,
    private expensesMonthService: ExpensesMonthService,
    private expensesService: ExpensesService) {
      this.restoreStickyFilters();
    }

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

  onStickyFilterChanged<T>(stickyFilter: StickyFilter<T>, value: StickyFilterItem<T>) {
    stickyFilter.selectedValue = value;
    localStorage.setItem(filtersStorageName, JSON.stringify(this.filters));
    this.fetchData().subscribe();
  }

  addStickyFilter(stickyFilterName: string) {
    if (this.stickyFilters[stickyFilterName] == null) {
      var definition = this.stickyFiltersDefinitions[stickyFilterName];

      if (definition != null) {
        this.stickyFilters[stickyFilterName] = {
          definition,
          selectedValue: definition.defaultValue
        }
      }

      localStorage.setItem(filtersStorageName, JSON.stringify(this.filters));
      this.fetchData().subscribe();
    }
  }

  removeStickyFilter(stickyFilterName: string) {
    if (this.stickyFilters[stickyFilterName] != null) {
      const adjustedFiltersList: Record<string, StickyFilter<number | undefined>> = {};

      Object.keys(this.stickyFilters).forEach((key) => {
        if (key !== stickyFilterName) {
          adjustedFiltersList[key] = this.stickyFilters[key];
        }
      });

      this.stickyFilters = adjustedFiltersList
      localStorage.setItem(filtersStorageName, JSON.stringify(this.filters));
      this.fetchData().subscribe();
    }
  }

  private fetchData() {
    return this.expensesHttpClient.getExpenses(this.expensesMonthService.month, this.filters)
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

  private restoreStickyFilters() {
    const savedFilters = localStorage.getItem(filtersStorageName);

    if (savedFilters != null) {
      const storedFilters = JSON.parse(savedFilters) as Record<string, StickyFilterItem<number | undefined>>;

      Object.keys(storedFilters).forEach((key) => {
        if (this.stickyFilters[key] == null) {
          var definition = this.stickyFiltersDefinitions[key];

          if (definition != null) {
            this.stickyFilters[key] = {
              definition,
              selectedValue: storedFilters[key]
            }
          }
        }
      });
    }
  }
}
