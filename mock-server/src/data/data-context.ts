import { Currency } from '../models/currency.model';
import { ExchangedPrice } from '../models/exchanged-price.model';
import { Expense } from '../models/expense.model';
import { currencies } from './currencies.data';
import { expenses } from './expenses.data';
import { mainCurrency } from './main-currency.data';

interface ExchangeRate {
  fromCurrencyId: number
  toCurrencyId: number
  rate: number
}

export class DataContext {
  public currencies: Currency[];
  public mainCurrency: Currency | null;
  public expenses: Expense[];
  public exchangedExpenses:Expense[];

  private exchangeRates: ExchangeRate[] = [
    {
      fromCurrencyId: 0,
      toCurrencyId: 1,
      rate: 1.29
    },
    {
      fromCurrencyId: 0,
      toCurrencyId: 2,
      rate: 0.012
    },
    {
      fromCurrencyId: 0,
      toCurrencyId: 3,
      rate: 0.011
    },
    {
      fromCurrencyId: 1,
      toCurrencyId: 0,
      rate: 0.78
    },
    {
      fromCurrencyId: 1,
      toCurrencyId: 2,
      rate: 0.0093
    },
    {
      fromCurrencyId: 1,
      toCurrencyId: 3,
      rate: 0.0085
    },
    {
      fromCurrencyId: 2,
      toCurrencyId: 0,
      rate: 83.40
    },
    {
      fromCurrencyId: 2,
      toCurrencyId: 1,
      rate: 107.55
    },
    {
      fromCurrencyId: 2,
      toCurrencyId: 3,
      rate: 0.92
    },
    {
      fromCurrencyId: 3,
      toCurrencyId: 0,
      rate: 91.06
    },
    {
      fromCurrencyId: 3,
      toCurrencyId: 1,
      rate: 117.42
    },
    {
      fromCurrencyId: 3,
      toCurrencyId: 2,
      rate: 1.09
    }
  ];

  constructor() {
    this.currencies = currencies;
    this.mainCurrency = mainCurrency;
    this.expenses = expenses;
    this.exchangedExpenses = [];
    this.recalculateExchangedExpenses();
  }

  public recalculateExchangedExpenses(){
    this.exchangedExpenses = this.exchangeExpenses();
  }

  private exchangeExpenses(): Expense[] {
    return this.expenses.map((e) => {
      const exchangeRate = this.exchangeRates.find((r) =>
        r.fromCurrencyId === e.price.currency.id &&
        r.toCurrencyId === this.mainCurrency?.id);

      let exchangedPrice: ExchangedPrice | undefined = undefined;

      if(exchangeRate) {
        exchangedPrice = {
          amount: e.price.amount * exchangeRate.rate,
          currency: this.currencies.find((c) => c.id === exchangeRate.toCurrencyId) ?? this.currencies[0],
          exchangeDate: e.date,
          exchangeRate: exchangeRate.rate,
          originalAmount: e.price.amount,
          originalCurrency: e.price.currency
        }
      }

      return {
        ...e,
        exchangedPrice
      }
    })
  }
}
