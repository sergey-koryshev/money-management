import { CurrencyService } from '@services/currency.service';
import { Component } from '@angular/core';
import { Currency } from '@models/currency.model';
import { User } from '@models/user.model';
import { emptyMainCurrency } from 'src/app/constants';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  currencies: Currency[];
  mainCurrency: Currency | null;
  user: User;
  emptyMainCurrency = emptyMainCurrency;
  searchForm: FormGroup;

  constructor(private currencyService: CurrencyService, private router: Router, private fb: FormBuilder) {
    this.currencies = this.currencyService.currencies;
    this.currencyService.mainCurrency$.subscribe((currency) => this.mainCurrency = currency)
    // TODO: need to remove this hardoced user once we implemented login process
    this.user = {
      id: '8eeb9d4b-d246-4075-a53a-fa31184f71ec',
      firstName: 'Sergey',
      secondName: 'Koryshev'
    };
    this.searchForm = fb.group({
      text: ['', Validators.required]
    });
   }

  setMainCurrency(currency: Currency) {
    this.currencyService.setMainCurrency(currency);
  }

  removeMainCurrency() {
    this.currencyService.removeMainCurrency();
  }

  onSearchFormSubmit() {
    this.router.navigate(['expenses/search'], {
      queryParams: this.searchForm.value
    });
  }
}
