import { Currency } from '../models/currency.model';
import { CurrencyEntity } from './entities/currency.entity';

export function currencyEntityToModel(entity: CurrencyEntity): Currency {
  return entity;
}

export const currencies: CurrencyEntity[] = [
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
