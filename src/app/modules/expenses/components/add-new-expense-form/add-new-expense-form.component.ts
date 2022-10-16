import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { CurrencyService } from '@services/currency.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Currency } from '@app/models/currency.model';

@Component({
  selector: 'app-add-new-expense-form',
  templateUrl: './add-new-expense-form.component.html',
  styleUrls: ['./add-new-expense-form.component.scss']
})
export class AddNewExpenseComponent implements OnInit {
  private defaultCurrencyIdStorageName = 'default-currency';
  currencies: Currency[]
  form = this.fb.group({
    'date': [this.currentDate, Validators.required],
    'item': [null, Validators.required],
    'priceAmount': [null, Validators.required],
    'currencyId': [this.defaultCurrency, Validators.required]
  });
  get currentDate(): NgbDate {
    const now = new Date();
    return new NgbDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }
  get defaultCurrency(): number {
    const currencyId = localStorage.getItem(this.defaultCurrencyIdStorageName);
    return currencyId ? Number(currencyId) : 0;
  }

  constructor(private fb: FormBuilder, currency: CurrencyService) {
    this.currencies = currency.currencies;
  }

  ngOnInit(): void {
    this.form.get('currencyId')?.valueChanges.subscribe((value) => {
      if (value) {
        localStorage.setItem(this.defaultCurrencyIdStorageName, String(value));
      }
    });
  }
}
