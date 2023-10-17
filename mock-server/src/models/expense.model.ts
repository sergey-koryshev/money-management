import { Category } from './category.model';
import { ExchangedPrice } from './exchanged-price.model';
import { Price } from './price.model';

export interface Expense {
  id?: number;
  date: Date;
  category?: Category;
  item: string;
  price: Price;
  exchangedPrice?: ExchangedPrice;
}
