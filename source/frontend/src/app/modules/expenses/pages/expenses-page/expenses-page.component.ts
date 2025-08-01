import { ExpensesMonthService } from '@services/expenses-month.service';
import { ExpensesHttpClientService } from '@http-clients/expenses-http-client.service';
import { CurrencyService } from '@services/currency.service';
import { Expense } from '@app/models/expense.model';
import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { switchMap, tap, catchError, map, take, skipWhile } from 'rxjs/operators';
import { NgbDatepickerNavigateEvent, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Month } from '@app/models/month.model';
import { AddNewExpenseDialogComponent } from '../../components/add-new-expense-dialog/add-new-expense-dialog.component';
import { Price } from '@app/models/price.model';
import { ItemChangedEventArgs } from '../../components/expenses-table/expenses-table.model';
import { SharedFilterOptions } from '@app/models/enums/shared-filter.enum';
import { CreatedByFilterOptions } from '@app/models/enums/created-by-filter.enum';
import { ExpensesService } from '../../expenses.service';
import { StickyFilterDefinition, StickyFilterType } from '@components/sticky-filters/sticky-filters.model';
import { ExpensesStickyFilterType } from '@app/models/enums/expenses-sticky-filter-type.enum';
import { BehaviorSubject, combineLatest, defer, NEVER, of } from 'rxjs';
import { CategoryHttpClient } from '@app/http-clients/category-http-client.service';
import { StoringExpensesStickyFilters } from './expenses-page.model';
import { emptyFilter, emptyCategoryFilter, filtersStorageName } from "@app/constants";
import { ExtendedExpenseName } from '@app/http-clients/expenses-http-client.model';
import { Currency } from '@app/models/currency.model';

@Component({
  selector: 'app-expenses-page',
  templateUrl: './expenses-page.component.html',
  styleUrls: ['./expenses-page.component.scss']
})
export class ExpensesPageComponent implements OnInit, AfterViewInit {

  readonly exchangeFaultedErrorMessage = 'Not all prices were converted successfully thus they were not taken into account in the counter.';
  readonly stickyAddExpenseButtonClass = 'sticky-add-expense-button';

  @ViewChild('addExpenseButton', { static: true }) addExpenseButton: any;
  @ViewChild('tableHeader', { static: true }) tableHeader: any;

  expenses: Expense[];
  selectedMonth: Month;
  totalAmount?: Price;
  isExchangeFaulted: boolean = false;
  loading = false;
  stickyFiltersDefinitions: Record<string, StickyFilterDefinition<any>>;
  stickyFilters$ = new BehaviorSubject<StoringExpensesStickyFilters>({});

  @HostListener('window:scroll')
  onWindowScroll() {
    if (!this.addExpenseButton || !this.tableHeader) {
      return;
    }

    const rect = this.tableHeader.nativeElement.getBoundingClientRect();
    if (rect.bottom < 0 || rect.bottom > window.innerHeight) {
      if (!this.addExpenseButton.nativeElement.classList.contains(this.stickyAddExpenseButtonClass)) {
        this.addExpenseButton.nativeElement.classList.add(this.stickyAddExpenseButtonClass);
        this.addExpenseButton.nativeElement.style.position = 'fixed';
        this.addExpenseButton.nativeElement.style.top = '5px';
        this.addExpenseButton.nativeElement.style.right = (window.innerWidth - this.tableHeader.nativeElement.offsetWidth) / 2 + 'px';
      }
    } else {
      this.addExpenseButton.nativeElement.classList.remove(this.stickyAddExpenseButtonClass);
      this.addExpenseButton.nativeElement.style.position = 'static';
      this.addExpenseButton.nativeElement.style.top = 'auto';
      this.addExpenseButton.nativeElement.style.right = 'auto';
    }
  }

  @HostListener('window:resize')
  onWindowResize() {
    if (!this.addExpenseButton || !this.tableHeader) {
      return;
    }

    if (this.addExpenseButton.nativeElement.classList.contains(this.stickyAddExpenseButtonClass)) {
      this.addExpenseButton.nativeElement.style.right = (window.innerWidth - this.tableHeader.nativeElement.offsetWidth) / 2 + 'px';
    }
  }

  constructor(
    private currencyService: CurrencyService,
    private expensesHttpClient: ExpensesHttpClientService,
    private modalService: NgbModal,
    private expensesMonthService: ExpensesMonthService,
    private expensesService: ExpensesService,
    private categoryHttpClient: CategoryHttpClient) {
      this.stickyFiltersDefinitions = {
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
                map(this.convertStringsToStickyFilterItem.bind(this)),
                catchError(() => of([]))
              );
          }),
          defaultValue: emptyFilter,
          multiselect: true,
          allItem: emptyFilter,
          placeholder: 'Select category'
        },
        [ExpensesStickyFilterType.names]: {
          type: StickyFilterType.dropdown,
          name: ExpensesStickyFilterType.names,
          displayName: ExpensesStickyFilterType.get(ExpensesStickyFilterType.names).name,
          searchFunc: (entry) => this.expensesHttpClient.getExistingNames(entry, true)
            .pipe(map(this.convertExtendedExpensesToStickyFilterItem.bind(this))),
          defaultValue: emptyFilter,
          multiselect: true,
          allItem: emptyFilter,
          placeholder: 'Search name...'
        },
        [ExpensesStickyFilterType.currencies]: {
          type: StickyFilterType.dropdown,
          name: ExpensesStickyFilterType.currencies,
          displayName: ExpensesStickyFilterType.get(ExpensesStickyFilterType.currencies).name,
          source: defer(() => this.currencyService.currencies$.asObservable()
            .pipe(
              skipWhile((c) => c.length === 0),
              take(1),
              map((c) => this.convertCurrencyToStickyFilterItem(c)),
              catchError(() => of([])))),
          defaultValue: emptyFilter,
          multiselect: true,
          allItem: emptyFilter,
          placeholder: 'Select currency'
        }
      };
    }

  ngOnInit(): void {
    this.selectedMonth = this.expensesMonthService.month;
  }

  ngAfterViewInit(): void {
    combineLatest([this.currencyService.mainCurrency$, this.expensesMonthService.month$, this.stickyFilters$])
      .pipe(
        switchMap(() => this.fetchData()))
      .subscribe();
  }

  open() {
    const modalRef = this.modalService.open(AddNewExpenseDialogComponent);
    modalRef.closed.subscribe((addedExpanse: Expense) => {
      const date = new Date(addedExpanse.date);

      if (this.expensesMonthService.month.month == date.getMonth() + 1 &&
        this.expensesMonthService.month.year == date.getFullYear() &&
        this.expensesService.testExpenseAgainstFilter(this.stickyFilters$.value, addedExpanse)) {
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
    this.loading = true;

    this.totalAmount = this.currencyService.mainCurrency
      ? {
        amount: 0,
        currency: this.currencyService.mainCurrency
      } : undefined;
    this.isExchangeFaulted = false;

    return this.expensesHttpClient.getExpenses(this.expensesMonthService.month, this.stickyFilters$.value)
      .pipe(
        catchError(() => {
          this.loading = false;
          return NEVER;
        }),
        tap((data) => {
          this.loading = false;
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

  private convertStringsToStickyFilterItem(values: string[]) {
    return [emptyCategoryFilter].concat(values.map((name) => ({
      name,
      value: name
    })));
  }

  private convertExtendedExpensesToStickyFilterItem(values: ExtendedExpenseName[]) {
    return values.map((v) => ({
      name: v.name,
      value: v.name
    }));
  }

  private convertCurrencyToStickyFilterItem(values: Currency[]) {
    return values.map((v) => ({
      name: v.name,
      value: v.id
    }));
  }

  onFiltersChanged(filters: StoringExpensesStickyFilters) {
    this.stickyFilters$.next(filters);
  }

  protected readonly filtersStorageName = filtersStorageName;
}
