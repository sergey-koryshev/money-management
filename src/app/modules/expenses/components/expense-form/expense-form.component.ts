import { ExpensesHttpClientService } from '@http-clients/expenses-http-client.service';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { CurrencyService } from '@services/currency.service';
import { CategoryHttpClient } from '@http-clients/category-http-client.service';
import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, NgSelectOption, Validators } from '@angular/forms';
import { Currency } from '@app/models/currency.model';
import { ExpensesMonthService } from '@app/services/expenses-month.service';
import { Month } from '@app/models/month.model';
import { Category } from '@app/models/category.model';
import { Observable, Subject, catchError, of, switchMap, tap } from 'rxjs';
import { ItemWithCategory } from '@app/http-clients/expenses-http-client.model';
import { Expense } from '@app/models/expense.model';
import { UserConnectionHttpClient } from '@app/http-clients/user-connections-http-client.service';
import { PolyUser, User } from '@app/models/user.model';
import { UserConnectionStatus } from '@app/models/enums/user-connection-status.enum';
import { getUserFullName } from '@app/helpers/users.helper';

@Component({
  selector: 'app-expense-form',
  templateUrl: './expense-form.component.html',
  styleUrls: ['./expense-form.component.scss']
})
export class ExpenseFormComponent implements OnInit {
  @Input()
  item?: Expense;

  private defaultCurrencyIdStorageName = 'default-currency';
  private lastUsedDateStorageName = 'last-date';
  private lastUsersToShareExpenseStorageName = 'last-users-to-share-expense';
  currencies: Currency[];
  categories: Category[];
  form: FormGroup;
  items$: Observable<ItemWithCategory[]>;
  searchEntry$ = new Subject<string>();
  loading: boolean;
  addItem: (item: string) => any;
  friends: PolyUser[];

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
    private categoriesHttpClient: CategoryHttpClient,
    private expensesHttpClient: ExpensesHttpClientService,
    private userConnectionsHttpClient: UserConnectionHttpClient) {
    this.currencies = currency.currencies;
    this.categoriesHttpClient.getAllCategories()
      .subscribe((categories) => this.categories = categories)
    this.userConnectionsHttpClient.getUserConnections()
      .subscribe((connections) => {
        this.friends = connections
          .filter((c) => c.status === UserConnectionStatus.accepted)
          .map((c) => c.user as User);

        if (this.item == null) {
          const lastUsers = this.lastUsersToShareExpense;
          this.form?.patchValue({
            sharedWith: this.friends.filter((u) => lastUsers?.includes(Number(u.id)))
          });
        }
      });
    this.items$ = this.searchEntry$.pipe(
      tap(() => this.loading = true),
      switchMap(searchEntry => this.expensesHttpClient.getExistingItems(searchEntry).pipe(
        catchError(() => of([])),
        tap(() => this.loading = false)
    )));
    this.addItem = (item) =>  ({ item, isNew: true });

    this.form = this.fb.group({
      'id': [null],
      'date': [this.getCurrentDate(expensesMonthService.month), Validators.required],
      'item': [null, Validators.required],
      'priceAmount': [null, Validators.required],
      'currencyId': [this.defaultCurrency, Validators.required],
      'category': [null],
      'sharedWith': [null],
      'description': [null]
    });

    this.form.controls['date'].valueChanges
      .subscribe(value => sessionStorage.setItem(this.lastUsedDateStorageName, JSON.stringify(value)));
  }

  ngOnInit(): void {
    this.populateValues(this.item);

    this.form.get('currencyId')?.valueChanges.subscribe((value) => {
      if (value) {
        localStorage.setItem(this.defaultCurrencyIdStorageName, String(value));
      }
    });

    this.form.get('sharedWith')?.valueChanges.subscribe((value: PolyUser[]) => {
      if (((this.item && !this.item.isShared) || (!this.item)) && value) {
        localStorage.setItem(this.lastUsersToShareExpenseStorageName, JSON.stringify(value.map((u) => u.id)));
      }
    });
  }

  getCurrentDate(month: Month): NgbDate {
    const lastDate = sessionStorage.getItem(this.lastUsedDateStorageName);
    let resultDate: NgbDate;

    if (lastDate != null) {
      resultDate = JSON.parse(lastDate) as NgbDate;
    } else {
      const currentDay = new Date().getDate();
      const daysInMonth = new Date(month.year, month.month, 0).getDate();
      resultDate = new NgbDate(month.year, month.month, currentDay > daysInMonth ? daysInMonth : currentDay);
    }

    return resultDate;
  }

  itemChanged(data: ItemWithCategory) {
    let category: Category | undefined;

    if (data !== undefined) {
      if (data.isNew) {
        return;
      }
      category = this.categories.find((c) => c.id === data.categoryId);
    } else {
      category = undefined;
    }

    this.form.patchValue({
      category: category
    });
  }

  populateValues(item?: Expense) {
    if (item == null) {
      return;
    }

    this.form.patchValue({
      id: item.id,
      date: new NgbDate(item.date.getFullYear(), item.date.getMonth() + 1, item.date.getDate()),
      item: item.item,
      priceAmount: item.price.amount,
      currencyId: item.price.currency.id,
      category: item.category,
      sharedWith: item.isShared ? null : item.sharedWith,
      description: item.description
    });
  }

  getUserFullName(user: PolyUser): string {
    return getUserFullName(user);
  }

  compareUsers(item: PolyUser, selected: PolyUser) {
    return item.id === selected.id;
  }
}
