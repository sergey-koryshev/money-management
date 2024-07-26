import { Currency } from '@models/currency.model';
import { Injectable } from '@angular/core';
import { BaseHttpClientService } from './base-http-client.service';
import { SetMainCurrencyParams } from './currency-http-client.model';

@Injectable({
  providedIn: 'root'
})
export class CurrencyHttpClientService {

  constructor(private baseHttpClient: BaseHttpClientService) {
    baseHttpClient.migratedEndpoints.push(
      {
        type: 'GET',
        path: 'currencies'
      },
      {
        type: 'GET',
        path: 'currencies/main'
      },
      {
        type: 'POST',
        path: 'currencies/main'
      },
      {
        type: 'DELETE',
        path: 'currencies/main'
      }
    );
  }

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
