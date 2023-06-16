import { Currency } from '../models/currency.model';

export const currencies: Currency[] = [
  {
    id: 0,
    name: 'RUB',
    friendlyName: 'Russian ruble',
    flagCode: 'ru',
    sign: '₽'
  },
  {
    id: 1,
    name: 'RSD',
    friendlyName: 'Serbian dinar',
    flagCode: 'rs'
  },
  {
    id: 2,
    name: 'USD',
    friendlyName: 'American dollar',
    flagCode: 'us',
    sign: '$'
  },
  {
    id: 3,
    name: 'EUR',
    friendlyName: 'Euro',
    flagCode: 'eu',
    sign: '€'
  }
]
