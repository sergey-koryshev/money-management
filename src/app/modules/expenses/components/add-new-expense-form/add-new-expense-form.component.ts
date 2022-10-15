import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { CurrencyService } from '@services/currency.service';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Currency } from '@app/models/currency.model';

@Component({
  selector: 'app-add-new-expense-form',
  templateUrl: './add-new-expense-form.component.html',
  styleUrls: ['./add-new-expense-form.component.scss']
})
export class AddNewExpenseComponent {

  currencies: Currency[]

  form = this.fb.group({
    'date': [this.currentDate, Validators.required],
    'item': [null, Validators.required],
    'priceAmount': [null, Validators.required],
    'currencyId': [null, Validators.required]
  })

  constructor(private fb: FormBuilder, currency: CurrencyService) {
    this.currencies = currency.currencies;
  }

  get currentDate(): NgbDate {
    const now = new Date();
    return new NgbDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }
}
