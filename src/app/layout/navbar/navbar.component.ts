import { CurrencyService } from './../../services/currency.service';
import { Component, OnInit } from '@angular/core';
import { Currency } from '@models/currency.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  currencies: Currency[];
  mainCurrency: Currency;

  constructor(currencyService: CurrencyService) {
    this.currencies = currencyService.currencies;
    this.mainCurrency = currencyService.mainCurrency;
   }

  ngOnInit(): void { }
}
