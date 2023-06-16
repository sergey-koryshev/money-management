import { ExchangedPrice } from './exchanged-price.model';
import { Price } from './prise.model';

export interface Expense {
  id?: number;
  date: Date;
  item: string;
  price: Price;
  exchangedPrice?: ExchangedPrice;
}
