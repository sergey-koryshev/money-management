import { Expense } from "../models/expense.model";
import { currencies } from "./currencies.data";

export const expenses: Expense[] = [
  {
    id: 0,
    date: new Date('2022-08-01'),
    item: 'Something I bought in Serbia',
    price: {
      amount: 134,
      currency: currencies[1],
    }
  },
  {
    id: 1,
    date: new Date('2022-08-02'),
    item: 'Something I bought in Russia',
    price: {
      amount: 1056,
      currency: currencies[0],
    }
  },
  {
    id: 2,
    date: new Date('2022-08-05'),
    item: 'Something I bought in Italy',
    price: {
      amount: 700,
      currency: currencies[3],
    }
  },
  {
    id: 3,
    date: new Date('2022-08-01'),
    item: 'Something I bought in Austria',
    price: {
      amount: 31,
      currency: currencies[3],
    }
  }
]
