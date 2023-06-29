import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { CurrencyService } from '@services/currency.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Currency } from '@app/models/currency.model';
import { ExpensesMonthService } from '@app/services/expenses-month.service';
import { Month } from '@app/models/month.model';

@Component({
  selector: 'app-add-new-expense-form',
  templateUrl: './add-new-expense-form.component.html',
  styleUrls: ['./add-new-expense-form.component.scss']
})
export class AddNewExpenseComponent implements OnInit {
  private defaultCurrencyIdStorageName = 'default-currency';
  currencies: Currency[];
  form: FormGroup;

  get defaultCurrency(): number {
    const currencyId = localStorage.getItem(this.defaultCurrencyIdStorageName);
    return currencyId ? Number(currencyId) : 0;
  }

  constructor(
    private fb: FormBuilder,
    currency: CurrencyService,
    expensesMonthService: ExpensesMonthService) {
    this.currencies = currency.currencies;

    this.form = this.fb.group({
      'date': [this.getCurrentDate(expensesMonthService.month), Validators.required],
      'item': [null, Validators.required],
      'priceAmount': [null, Validators.required],
      'currencyId': [this.defaultCurrency, Validators.required]
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
}
