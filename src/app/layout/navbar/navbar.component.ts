import { CurrencyService } from './../../services/currency.service';
import { Component, OnInit } from '@angular/core';
import { Currency } from '@models/currency.model';
import { User } from '@models/user.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  currencies: Currency[];
  mainCurrency: Currency;
  user: User;

  constructor(currencyService: CurrencyService) {
    this.currencies = currencyService.currencies;
    this.mainCurrency = currencyService.mainCurrency;
    // TODO: need to remove this hardoced user once we implemented login process
    this.user = {
      id: '8eeb9d4b-d246-4075-a53a-fa31184f71ec',
      firstName: 'Sergey',
      secondName: 'Koryshev'
    };
   }

  ngOnInit(): void { }
}
