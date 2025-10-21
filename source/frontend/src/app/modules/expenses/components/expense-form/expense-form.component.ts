import { ExpensesHttpClientService } from '@http-clients/expenses-http-client.service';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { CurrencyService } from '@services/currency.service';
import { Component, OnInit, Input, OnChanges, SimpleChanges, LOCALE_ID, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Currency } from '@app/models/currency.model';
import { ExpensesMonthService } from '@app/services/expenses-month.service';
import { Month } from '@app/models/month.model';
import { Observable, Subject, catchError, defer, of, switchMap, tap } from 'rxjs';
import { ChangeExpenseParams, ExtendedExpenseName } from '@app/http-clients/expenses-http-client.model';
import { Expense } from '@app/models/expense.model';
import { AmbiguousUser, User } from '@app/models/user.model';
import { UserConnectionStatus } from '@app/models/enums/user-connection-status.enum';
import { getUserFullName } from '@app/helpers/users.helper';
import { UserService } from '@app/services/user.service';
import { CategoryHttpClient } from '@app/http-clients/category-http-client.service';
import { ExpensesService } from "@app/modules/expenses/expenses.service";

interface ExtendedExpenseNameForm extends ExtendedExpenseName {
  isNew: boolean
}

@Component({
  selector: 'app-expense-form',
  templateUrl: './expense-form.component.html',
  styleUrls: ['./expense-form.component.scss']
})
export class ExpenseFormComponent implements OnInit, OnChanges {
  @Input()
  item?: Expense;

  private readonly currentUser: User | null;

  private defaultCurrencyIdStorageName = 'default-currency';
  private lastUsedDateStorageName = 'last-date';
  private lastUsersToShareExpenseStorageName = 'last-users-to-share-expense';
  private isItemShared = false;

  currencies: Currency[];
  form: FormGroup;
  names$: Observable<ExtendedExpenseName[]>;
  categories$: Observable<string[]>;
  searchEntry$ = new Subject<string>();
  loading: boolean;
  categoriesLoading: boolean;
  addExpenseName = (name: string) => ({ name, isNew: true })
  friends: AmbiguousUser[];

  get defaultCurrency(): number {
    const currencyId = localStorage.getItem(this.defaultCurrencyIdStorageName);
    return currencyId ? Number(currencyId) : 0;
  }

  get lastUsersToShareExpense() : number[] | null {
    const jsonUserIds = localStorage.getItem(this.lastUsersToShareExpenseStorageName);
    return jsonUserIds ? JSON.parse(jsonUserIds) : null;
  }

  constructor(
    private fb: FormBuilder,
    currency: CurrencyService,
    expensesMonthService: ExpensesMonthService,
    private expensesHttpClient: ExpensesHttpClientService,
    private userService: UserService,
    categoryHttpClient: CategoryHttpClient,
    private expensesService: ExpensesService) {
    this.currentUser = userService.user;
    this.isItemShared = this.checkIfItemShared(this.item);
    this.currencies = currency.currencies;
    this.categories$ = defer(() => {
      this.categoriesLoading = true;
      return categoryHttpClient.getUniqueCategoryNames()
        .pipe(
          catchError(() => of([])),
          tap(() => this.categoriesLoading = false)
        );
    });

    this.names$ = this.searchEntry$.pipe(
      tap(() => this.loading = true),
      switchMap(searchEntry => this.expensesHttpClient.getExistingNames(searchEntry, false).pipe(
        catchError(() => of([])),
        tap(() => this.loading = false)
    )));

    this.form = this.fb.group({
      'id': [null],
      'date': [this.getCurrentDate(expensesMonthService.month), Validators.required],
      'name': [null, Validators.required],
      'priceAmount': [null, [Validators.required, expensesService.numberValidator()]],
      'currencyId': [this.defaultCurrency, Validators.required],
      'categoryName': [null],
      'permittedPersons': [[]],
      'description': [null]
    });

    this.userService.connections$
      .subscribe((connections) => {
        this.friends = connections
          .filter((c) => c.status === UserConnectionStatus.accepted)
          .map((c) => c.person as AmbiguousUser);

        if (this.item == null) {
          const lastUsers = this.lastUsersToShareExpense;
          this.form?.patchValue({
            permittedPersons: this.friends.filter((u) => lastUsers?.includes(Number(u.id)))
          });
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.item && changes.item.firstChange) {
      this.userService.connections$
        .subscribe(() => {
            if (this.item != null) {
              if (!this.isItemShared && this.item.permittedPersons.length > 0) {
                this.item.permittedPersons.forEach((p: AmbiguousUser) => {
                  if (!this.friends.some(f => f.id === p.id)) {
                    this.friends.push(p);
                  }
                });
              }
            }
        });

      this.populateValues(this.item);
    }
  }

  ngOnInit(): void {
    // save last date to local storage
    this.form.controls['date'].valueChanges.subscribe(value => {
      if (value) {
        sessionStorage.setItem(this.lastUsedDateStorageName, JSON.stringify(value));
      }
    });

    // save last currency to local storage
    this.form.get('currencyId')?.valueChanges.subscribe((value) => {
      if (value) {
        localStorage.setItem(this.defaultCurrencyIdStorageName, String(value));
      }
    });

    // save last list of permitted persons ids to local storage
    this.form.get('permittedPersons')?.valueChanges.subscribe((value: AmbiguousUser[]) => {
      // we save it only if item is not shared or if item is being created
      if (((this.item && !this.isItemShared) || (!this.item)) && value) {
        localStorage.setItem(this.lastUsersToShareExpenseStorageName, JSON.stringify(value.map((u) => u.id)));
      }
    });
  }

  getCurrentDate(month: Month): NgbDate {
    const lastDate = sessionStorage.getItem(this.lastUsedDateStorageName);
    let resultDate: NgbDate;

    if (lastDate != null) {
      // TODO: check UX when user change month and there is pre-populated date for another month
      // do we need to clean it in this case or just not set it as a default value?
      resultDate = JSON.parse(lastDate) as NgbDate;
    } else {
      const currentDay = new Date().getDate();
      const daysInMonth = new Date(month.year, month.month, 0).getDate();
      resultDate = new NgbDate(month.year, month.month, currentDay > daysInMonth ? daysInMonth : currentDay);
    }

    return resultDate;
  }

  nameChanged(data: ExtendedExpenseNameForm) {
    if (data.isNew) {
      return;
    }

    this.form.patchValue({
      categoryName: data.categoryName
    });

    // mark category as untouched since it was auto-populated
    this.form.get('categoryName')?.markAsUntouched();
  }

  nameCleared() {
    // if category was auto-populated, we need to clear it when name is cleared
    if (!this.form.get('categoryName')?.touched) {
      this.form.patchValue({
        categoryName: null
      });
    }
  }

  populateValues(item?: Expense) {
    if (item == null) {
      return;
    }

    this.form.patchValue({
      id: item.id,
      date: new NgbDate(item.date.getFullYear(), item.date.getMonth() + 1, item.date.getDate()),
      name: item.name,
      priceAmount: item.originalPrice?.amount ?? item.price.amount,
      currencyId: item.originalPrice?.currency.id ?? item.price.currency.id,
      categoryName: item.category?.name,
      permittedPersons: this.isItemShared ? [] : item.permittedPersons,
      description: item.description
    });
  }

  getUserFullName(user: AmbiguousUser): string {
    return getUserFullName(user);
  }

  compareUsers(item: AmbiguousUser, selected: AmbiguousUser) {
    return item.id === selected.id;
  }

  checkIfItemShared(item?: Expense) {
    if (item == null) {
      return false;
    }

    return item.createdBy.id !== this.currentUser?.id;
  }

  isSharedWithLookupVisible(item?: Expense) {
    const hasFriends = this.friends != null && this.friends.length > 0;

    return (item == null && hasFriends) ||
      (item != null && item.createdBy.id === this.currentUser?.id && (item!.permittedPersons.length > 0 || hasFriends))
  }

  getValue = (): ChangeExpenseParams => {
    const { date, priceAmount, permittedPersons, ...restParams } = this.form.value;

    return {
      date: new Date(date.year, date.month - 1, date.day),
      priceAmount: this.expensesService.normalizeNumberString(priceAmount),
      permittedPersonsIds: permittedPersons?.map((u: AmbiguousUser) => Number(u.id)),
      ...restParams
    }
  }
}
