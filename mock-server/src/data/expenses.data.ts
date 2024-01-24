import { categories, categoryEntityToModel } from './categories.data';
import { currencies, currencyEntityToModel } from './currencies.data';
import { userEntityToModel, users } from './users.data';
import { Expense } from '../models/expense.model';
import { ExpenseEntity } from './entities/expense.entity';
import { exchangeRates } from './exchange-rates.data';
import { mainCurrencies } from './main-currencies.data';

export function expenseEntityToModel(entity: ExpenseEntity, tenant: string | undefined = undefined): Expense {
  const originalCurrencyEntity = currencies.find((c) => c.id === entity.priceCurrencyId);

  if (!originalCurrencyEntity) {
    throw new Error(`Currency with Id ${entity.priceCurrencyId} doesn't exist`);
  }

  const categoryEntity = categories.find((c) => c.id === entity.categoryId && entity.tenant);

  if (!categoryEntity && entity.categoryId != null) {
    throw new Error(`Category with ${entity.categoryId} doesn't exist`);
  }

  const mainCurrencyEntity = mainCurrencies.find((m) => m.tenant === (tenant ?? entity.tenant));
  const exchangeRateEntity = mainCurrencyEntity
    ? exchangeRates.find((e) => e.fromCurrencyId === originalCurrencyEntity.id && e.toCurrencyId === mainCurrencyEntity.currencyId)
    : undefined;

  if (!exchangeRateEntity && mainCurrencyEntity && originalCurrencyEntity.id !== mainCurrencyEntity.currencyId) {
    throw new Error(`Exchanged rate for pair ${originalCurrencyEntity.id}/${mainCurrencyEntity.currencyId} doesn't exist`);
  }

  const creator = users.find((u) => u.tenant === entity.tenant);

  if (!creator) {
    throw new Error(`User with tenant ${entity.tenant} doesn't exist`);
  }

  const model: Expense = {
    id: entity.id,
    date: entity.date,
    category: categoryEntity ? categoryEntityToModel(categoryEntity) : undefined,
    item: entity.item,
    price: {
      amount: entity.priceAmount,
      currency: currencyEntityToModel(originalCurrencyEntity)
    },
    exchangedPrice: exchangeRateEntity ? {
      amount: entity.priceAmount * exchangeRateEntity.rate,
      currency: currencyEntityToModel(currencies.find((c) => c.id === mainCurrencyEntity?.currencyId) ?? currencies[0]),
      exchangeDate: entity.date,
      exchangeRate: exchangeRateEntity.rate,
      originalAmount: entity.priceAmount,
      originalCurrency: currencyEntityToModel(originalCurrencyEntity)
    } : undefined,
    createdBy: userEntityToModel(creator)
  }
  return model;
}

export const expenses: ExpenseEntity[] = [
  {
    id: 0,
    date: new Date('2022-08-01'),
    item: 'Zavičaj',
    categoryId: 0,
    priceAmount: 750,
    priceCurrencyId: 1,
    tenant: '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    id: 1,
    date: new Date('2022-08-02'),
    item: 'Ozon',
    categoryId: 2,
    priceAmount: 1056,
    priceCurrencyId: 0,
    tenant: '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    id: 2,
    date: new Date('2022-08-05'),
    item: 'Trapizzino',
    categoryId: 0,
    priceAmount: 29.30,
    priceCurrencyId: 3,
    tenant: '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    id: 3,
    date: new Date('2022-08-01'),
    item: 'Konzum',
    categoryId: 1,
    priceAmount: 31,
    priceCurrencyId: 3,
    tenant: '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    id: 4,
    date: new Date('2022-08-01'),
    item: 'Dolac',
    categoryId: 3,
    priceAmount: 13.50,
    priceCurrencyId: 3,
    tenant: 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    id: 5,
    date: new Date('2022-08-02'),
    item: 'Wolt',
    categoryId: 4,
    priceAmount: 26,
    priceCurrencyId: 3,
    tenant: 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    id: 5,
    date: new Date('2022-08-03'),
    item: 'Wolt',
    categoryId: 4,
    priceAmount: 2190,
    priceCurrencyId: 1,
    tenant: 'f1d4515b-f201-4696-86b8-3580ad740ada'
  }
]
