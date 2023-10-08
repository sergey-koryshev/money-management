import { ExpensesHttpClientService } from '@http-clients/expenses-http-client.service';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { CurrencyService } from '@services/currency.service';
import { CategoryHttpClient } from '@http-clients/category-http-client.service';
import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Currency } from '@app/models/currency.model';
import { ExpensesMonthService } from '@app/services/expenses-month.service';
import { Month } from '@app/models/month.model';
import { Category } from '@app/models/category.model';
import { Observable, Subject, catchError, of, switchMap, tap } from 'rxjs';
import { ItemWithCategory } from '@app/http-clients/expenses-http-client.model';
import { Expense } from '@app/models/expense.model';

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
  currencies: Currency[];
  categories: Category[];
  form: FormGroup;
  items$: Observable<ItemWithCategory[]>;
  searchEntry$ = new Subject<string>();
  loading: boolean;
  addItem: (item: string) => any;

  get defaultCurrency(): number {
    const currencyId = localStorage.getItem(this.defaultCurrencyIdStorageName);
    return currencyId ? Number(currencyId) : 0;
  }

  constructor(
    private fb: FormBuilder,
    currency: CurrencyService,
    expensesMonthService: ExpensesMonthService,
    private categoriesHttpClient: CategoryHttpClient,
    private expensesHttpClient: ExpensesHttpClientService) {
    this.currencies = currency.currencies;
    this.categoriesHttpClient.getAllCategories()
      .subscribe((categories) => this.categories = categories)
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
      'category': [null]
    });

    this.form.controls['date'].valueChanges
      .subscribe(value => sessionStorage.setItem(this.lastUsedDateStorageName, JSON.stringify(value)));
  }

  ngOnInit(): void {
    this.form.get('currencyId')?.valueChanges.subscribe((value) => {
      if (value) {
        localStorage.setItem(this.defaultCurrencyIdStorageName, String(value));
      }
    });

    this.populateValues(this.item);
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
      category: item.category
    });
  }
}
