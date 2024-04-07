import { Currency } from '@models/currency.model';
import { Injectable } from '@angular/core';
import { BaseHttpClientService } from './base-http-client.service';
import { SetMainCurrencyParams } from './currency-http-client.model';

@Injectable({
  providedIn: 'root'
})
export class CurrencyHttpClientService {

  constructor(private baseHttpClient: BaseHttpClientService) { }

  getAllCurrencies() {
    return this.baseHttpClient.get<Currency[]>('currencies');
  }

  getMainCurrency() {
    return this.baseHttpClient.get<Currency>('currencies/main');
  }

  setMainCurrency(params: SetMainCurrencyParams) {
    return this.baseHttpClient.post<Currency>('currencies/main', params);
  }

  removeMainCurrency() {
    return this.baseHttpClient.delete('currencies/main');
  }
}
