import { map } from 'rxjs/operators';
import { Currency } from './../models/currency.model';
import { CurrencyHttpClientService } from './../http-clients/currency-http-client.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin } from 'rxjs';

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

  constructor(private currencyHttpClient: CurrencyHttpClientService) { 
    this.currencies$ = new BehaviorSubject<Currency[]>([]);
    this.mainCurrency$ = new BehaviorSubject<Currency | null>(null);
  }

  load() {
    const currencies$ = this.currencyHttpClient.getAllCurrencies();
    const mainCurrency$ = this.currencyHttpClient.getMainCurrency();

    return forkJoin([currencies$, mainCurrency$]).pipe(map(([currencies, mainCurrency]) => {
      this.currencies$.next(currencies);
      this.mainCurrency$.next(mainCurrency);
    })).toPromise();
  }

  setMainCurrency(currency: Currency) {
    this.currencyHttpClient.setMainCurrency(currency)
      .subscribe((currency) => this.mainCurrency$.next(currency));
  }
}
