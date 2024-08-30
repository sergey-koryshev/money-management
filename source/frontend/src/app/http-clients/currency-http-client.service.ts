import { Currency } from '@models/currency.model';
import { Injectable } from '@angular/core';
import { BaseHttpClientService } from './base-http-client.service';

@Injectable({
  providedIn: 'root'
})
export class CurrencyHttpClientService {

  constructor(private baseHttpClient: BaseHttpClientService) {}

  getAllCurrencies() {
    return this.baseHttpClient.get<Currency[]>('currencies');
  }

  getMainCurrency() {
    return this.baseHttpClient.get<Currency>('currencies/main');
  }

  setMainCurrency(currencyId: number) {
    return this.baseHttpClient.post<Currency>('currencies/main', currencyId);
  }

  removeMainCurrency() {
    return this.baseHttpClient.delete('currencies/main');
  }
}
