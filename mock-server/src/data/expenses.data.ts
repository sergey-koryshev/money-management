import { Expense } from '../models/expense.model';
import { categories } from './categories.data';
import { currencies } from './currencies.data';

export const expenses: Expense[] = [
  {
    id: 0,
    date: new Date('2022-08-01'),
    item: 'Zavičaj',
    category: categories[0],
    price: {
      amount: 750,
      currency: currencies[1],
    }
  },
  {
    id: 1,
    date: new Date('2022-08-02'),
    item: 'Ozon',
    category: categories[2],
    price: {
      amount: 1056,
      currency: currencies[0],
    }
  },
  {
    id: 2,
    date: new Date('2022-08-05'),
    item: 'Trapizzino',
    category: categories[0],
    price: {
      amount: 29.30,
      currency: currencies[3],
    }
  },
  {
    id: 3,
    date: new Date('2022-08-01'),
    item: 'Konzum',
    category: categories[1],
    price: {
      amount: 31,
      currency: currencies[3],
    }
  }
]
