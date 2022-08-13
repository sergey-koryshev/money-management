import { Currency } from '@models/currency.model';
import { Injectable } from '@angular/core';
import { BaseHttpClientService } from './base-http-client.service';

@Injectable({
  providedIn: 'root'
})
export class CurrencyHttpClientService {

  constructor(private baseHttpClient: BaseHttpClientService) { }

  getAllCurrencies() {
    return this.baseHttpClient.get<Currency[]>('currency');
  }

  getMainCurrency() {
    return this.baseHttpClient.get<Currency>('currency/main');
  }

  setMainCurrency(currency: Currency) {
    return this.baseHttpClient.post<Currency>('currency/main', currency);
  }

  removeMainCurrency() {
    return this.baseHttpClient.delete('currency/main');
  }
}
