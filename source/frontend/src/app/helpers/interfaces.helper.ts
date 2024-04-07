import { Price } from '@app/models/price.model';
import { ExchangedPrice } from '../models/exchanged-price.model';

export function isInstanceOfExchangedPrice(price: Price): price is ExchangedPrice {
    return price
        ? 'originalCurrency' in price &&
            'originalAmount' in price &&
            'exchangeRate' in price &&
            'exchangeDate' in price
        : false
}
