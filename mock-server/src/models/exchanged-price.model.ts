import { Currency } from './currency.model';
import { Price } from './prise.model';

export interface ExchangedPrice extends Price {
  originalCurrency: Currency;
  originalAmount: number;
  exchangeRate: number;
  exchangeDate: Date;
}
