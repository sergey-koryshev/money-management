import { ExchangeRateEntity } from './entities/exchange-rate.entity';

export const exchangeRates: ExchangeRateEntity[] = [
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
