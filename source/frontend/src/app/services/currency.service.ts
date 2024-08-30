import { Currency } from '../models/currency.model';
import { CurrencyHttpClientService } from '../http-clients/currency-http-client.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  currencies$: BehaviorSubject<Currency[]>;
  mainCurrency$: BehaviorSubject<Currency | null>;
  get currencies() {
    return this.currencies$.value;
  }
  get mainCurrency() {
    return this.mainCurrency$.value;
  }

  constructor(private currencyHttpClient: CurrencyHttpClientService, private userService: UserService) {
    this.currencies$ = new BehaviorSubject<Currency[]>([]);
    this.mainCurrency$ = new BehaviorSubject<Currency | null>(null);
  }

  initialize() {
    this.userService.user$.subscribe((user) => {
      if (user) {
        this.fetchCategories();
      }
    });
  }

  fetchCategories() {
    const currencies$ = this.currencyHttpClient.getAllCurrencies();
    const mainCurrency$ = this.currencyHttpClient.getMainCurrency();

    forkJoin([currencies$, mainCurrency$]).subscribe(([currencies, mainCurrency]) => {
      this.currencies$.next(currencies);
      this.mainCurrency$.next(mainCurrency);
    });
  }

  setMainCurrency(currencyId: number) {
    this.currencyHttpClient.setMainCurrency(currencyId)
      .subscribe((currency) => this.mainCurrency$.next(currency));
  }

  removeMainCurrency() {
    this.currencyHttpClient.removeMainCurrency()
      .subscribe(() => this.mainCurrency$.next(null));
  }
}
