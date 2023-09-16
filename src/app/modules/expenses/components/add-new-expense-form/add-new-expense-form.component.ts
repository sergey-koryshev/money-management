import { ExpensesHttpClientService } from '@http-clients/expenses-http-client.service';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { CurrencyService } from '@services/currency.service';
import { CategoryHttpClient } from '@http-clients/category-http-client.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Currency } from '@app/models/currency.model';
import { ExpensesMonthService } from '@app/services/expenses-month.service';
import { Month } from '@app/models/month.model';
import { Category } from '@app/models/category.model';
import { Observable, Subject, catchError, of, switchMap, tap } from 'rxjs';
import { ItemWithCategory } from '@app/http-clients/expenses-http-client.model';

@Component({
  selector: 'app-add-new-expense-form',
  templateUrl: './add-new-expense-form.component.html',
  styleUrls: ['./add-new-expense-form.component.scss']
})
export class AddNewExpenseComponent implements OnInit {
  private defaultCurrencyIdStorageName = 'default-currency';
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
      'date': [this.getCurrentDate(expensesMonthService.month), Validators.required],
      'item': [null, Validators.required],
      'priceAmount': [null, Validators.required],
      'currencyId': [this.defaultCurrency, Validators.required],
      'category': [null]
    });
  }

  ngOnInit(): void {
    this.form.get('currencyId')?.valueChanges.subscribe((value) => {
      if (value) {
        localStorage.setItem(this.defaultCurrencyIdStorageName, String(value));
      }
    });
  }

  getCurrentDate(month: Month): NgbDate {
    const currentDay = new Date().getDate();
    const daysInMonth = new Date(month.year, month.month, 0).getDate();
    return new NgbDate(month.year, month.month, currentDay > daysInMonth ? daysInMonth : currentDay);
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
}
