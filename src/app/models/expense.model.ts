import { Category } from "./category.model";
import { ExchangedPrice } from "./exchanged-price.model";
import { Price } from "./price.model";
import { User } from "./user.model";

export interface Expense {
    id?: number
    date: Date
    category: Category
    item: string
    price: Price
    exchangedPrice?: ExchangedPrice
    createdBy: User
}
