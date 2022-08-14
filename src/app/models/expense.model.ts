import { ExchangedPrice } from "./exchanged-price.model";
import { Price } from "./price.model";

export interface Expense {
    id: number;
    date: Date;
    item: string;
    price: Price;
    exchangedPrice: ExchangedPrice;
}