import { map } from 'rxjs/operators';
import { Currency } from './../models/currency.model';
import { CurrencyHttpClientService } from './../http-clients/currency-http-client.service';
import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  currencies: Currency[];
  mainCurrency: Currency;

  constructor(private currencyHttpClient: CurrencyHttpClientService) { }

  load() {
    const currencies$ = this.currencyHttpClient.getAllCurrencies();
    const mainCurrency$ = this.currencyHttpClient.getMainCurrency();

    return forkJoin([currencies$, mainCurrency$]).pipe(map(([currencies, mainCurrency]) => {
      this.currencies = currencies;
      this.mainCurrency = mainCurrency;
    })).toPromise();
  }
}
