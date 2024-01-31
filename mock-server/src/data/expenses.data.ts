import { categories, categoryEntityToModel } from './categories.data';
import { currencies, currencyEntityToModel } from './currencies.data';
import { userEntityToModel, users } from './users.data';
import { Expense } from '../models/expense.model';
import { ExpenseEntity } from './entities/expense.entity';
import { PolyUser } from '../models/user.model';
import { UserEntity } from './entities/user.entity';
import { exchangeRates } from './exchange-rates.data';
import { expensesToUsers } from './expense-to-users.data';
import { mainCurrencies } from './main-currencies.data';
import { userConnections } from './user-connections.data';

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

  const currentUser = tenant ? users.find((u) => u.tenant === tenant) : creator;

  if (!currentUser) {
    throw new Error(`User with tenant ${tenant} doesn't exist`);
  }

  const sharedWithUserIds = expensesToUsers.filter((e) => e.expenseId === entity.id).map((e) => e.userId);
  const friendsIds = userConnections
    .filter((c) => (c.requestorUserId === currentUser.id || c.targetUserId === currentUser.id) && c.accepted)
    .map((c) => c.requestorUserId === currentUser.id ? c.targetUserId : c.requestorUserId);
  const sharedWith: PolyUser[] = (!tenant || entity.tenant === tenant)
    ? users.filter((u) => {
      if (!u.id) {
        return false;
      }

      return sharedWithUserIds.includes(u.id);
    }).map((u) => getSharedUserModel(friendsIds, u, Number(currentUser.id)))
    : sharedWithUserIds.length === 0 ? [] : [getSharedUserModel(friendsIds, creator, Number(currentUser.id))];
  const canBeEdited = !!tenant && entity.tenant !== tenant
    ? sharedWith.length > 0 && friendsIds.includes(Number(sharedWith[0].id))
    : true;

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
    sharedWith: sharedWith,
    isShared: !!tenant && entity.tenant !== tenant,
    canBeEdited: canBeEdited
  }
  return model;
}

export const expenses: ExpenseEntity[] = [
  {
    'id': 1,
    'date': new Date('2023.11.01'),
    'categoryId': 1,
    'item': 'Amazon',
    'priceAmount': 101.84,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 2,
    'date': new Date('2023.11.02'),
    'categoryId': 2,
    'item': 'Bread Club',
    'priceAmount': 1.5,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 3,
    'date': new Date('2023.11.02'),
    'categoryId': 3,
    'item': 'Poliklinika Kvaternik',
    'priceAmount': 60,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 4,
    'date': new Date('2023.11.03'),
    'categoryId': 3,
    'item': 'Ljekarna',
    'priceAmount': 4.78,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 5,
    'date': new Date('2023.11.03'),
    'categoryId': 4,
    'item': 'Konzum',
    'priceAmount': 1.65,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 6,
    'date': new Date('2023.11.03'),
    'categoryId': 4,
    'item': 'Glovo Express',
    'priceAmount': 26.48,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 7,
    'date': new Date('2023.11.03'),
    'categoryId': 5,
    'item': 'La Passione',
    'priceAmount': 31.3,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 8,
    'date': new Date('2023.11.04'),
    'categoryId': 6,
    'item': 'Dolac',
    'priceAmount': 19.3,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 9,
    'date': new Date('2023.11.04'),
    'categoryId': 7,
    'item': 'Postcard',
    'priceAmount': 1,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 10,
    'date': new Date('2023.11.04'),
    'categoryId': 3,
    'item': 'Ljekarna',
    'priceAmount': 8.64,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 11,
    'date': new Date('2023.11.04'),
    'categoryId': 4,
    'item': 'Muller',
    'priceAmount': 6.64,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 12,
    'date': new Date('2023.11.05'),
    'categoryId': 8,
    'item': 'Balance',
    'priceAmount': 10.3,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 13,
    'date': new Date('2023.11.06'),
    'categoryId': 4,
    'item': 'Spar',
    'priceAmount': 5.88,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 14,
    'date': new Date('2023.11.06'),
    'categoryId': 2,
    'item': 'Bread Club',
    'priceAmount': 5,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 15,
    'date': new Date('2023.11.06'),
    'categoryId': 9,
    'item': 'Four Wheels',
    'priceAmount': 3.6,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 16,
    'date': new Date('2023.11.08'),
    'categoryId': 5,
    'item': 'Izakaya',
    'priceAmount': 26,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 17,
    'date': new Date('2023.11.09'),
    'categoryId': 10,
    'item': 'Vintessa',
    'priceAmount': 39,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 18,
    'date': new Date('2023.11.09'),
    'categoryId': 4,
    'item': 'Cromaris',
    'priceAmount': 5.84,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 19,
    'date': new Date('2023.11.09'),
    'categoryId': 2,
    'item': 'Bread Club',
    'priceAmount': 1.5,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 20,
    'date': new Date('2023.11.09'),
    'categoryId': 9,
    'item': 'Cogito',
    'priceAmount': 7.6,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 21,
    'date': new Date('2023.11.09'),
    'categoryId': 11,
    'item': 'DM',
    'priceAmount': 15.05,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 22,
    'date': new Date('2023.11.11'),
    'categoryId': 9,
    'item': "Eli's caffe",
    'priceAmount': 19,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 23,
    'date': new Date('2023.11.11'),
    'categoryId': 12,
    'item': 'H&M',
    'priceAmount': 7.99,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 24,
    'date': new Date('2023.11.11'),
    'categoryId': 4,
    'item': 'Konzum',
    'priceAmount': 23.49,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 25,
    'date': new Date('2023.11.11'),
    'categoryId': 8,
    'item': 'Balance',
    'priceAmount': 30.1,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 26,
    'date': new Date('2023.11.11'),
    'categoryId': 4,
    'item': 'Spar',
    'priceAmount': 3.57,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 27,
    'date': new Date('2023.11.11'),
    'categoryId': 2,
    'item': 'Bread Club',
    'priceAmount': 1.5,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 28,
    'date': new Date('2023.11.11'),
    'categoryId': 1,
    'item': 'Zalando',
    'priceAmount': 198.35,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 29,
    'date': new Date('2023.11.11'),
    'categoryId': 13,
    'item': 'Hrvatski Telekom',
    'priceAmount': 51.01,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 30,
    'date': new Date('2023.11.12'),
    'categoryId': 6,
    'item': 'Dolac',
    'priceAmount': 20.05,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 31,
    'date': new Date('2023.11.12'),
    'categoryId': 8,
    'item': 'La Struk',
    'priceAmount': 22,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 32,
    'date': new Date('2023.11.12'),
    'categoryId': 4,
    'item': 'Konzum',
    'priceAmount': 28.42,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 33,
    'date': new Date('2023.11.12'),
    'categoryId': 4,
    'item': 'Spar',
    'priceAmount': 2.79,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 34,
    'date': new Date('2023.11.12'),
    'categoryId': 14,
    'item': 'Sweet Bite',
    'priceAmount': 5.5,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 35,
    'date': new Date('2023.11.12'),
    'categoryId': 8,
    'item': 'Submarine',
    'priceAmount': 5,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 36,
    'date': new Date('2023.11.13'),
    'categoryId': 2,
    'item': 'Bread Club',
    'priceAmount': 1.5,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 37,
    'date': new Date('2023.11.13'),
    'categoryId': 7,
    'item': 'Post',
    'priceAmount': 1.7,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 38,
    'date': new Date('2023.11.15'),
    'categoryId': 15,
    'item': 'Rent+utilities',
    'priceAmount': 1230,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 39,
    'date': new Date('2023.11.16'),
    'categoryId': 4,
    'item': 'Konzum',
    'priceAmount': 4.92,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 40,
    'date': new Date('2023.11.16'),
    'categoryId': 11,
    'item': 'DM',
    'priceAmount': 9.34,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 41,
    'date': new Date('2023.11.18'),
    'categoryId': 4,
    'item': 'Maxi',
    'priceAmount': 1248.95,
    'priceCurrencyId': 1,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 42,
    'date': new Date('2023.11.18'),
    'categoryId': 8,
    'item': 'Kafana ?',
    'priceAmount': 3600,
    'priceCurrencyId': 1,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 43,
    'date': new Date('2023.11.18'),
    'categoryId': 9,
    'item': 'Cafe Nero',
    'priceAmount': 8.6,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 44,
    'date': new Date('2023.11.18'),
    'categoryId': 11,
    'item': 'DM',
    'priceAmount': 269,
    'priceCurrencyId': 1,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 45,
    'date': new Date('2023.11.18'),
    'categoryId': 16,
    'item': 'Booking',
    'priceAmount': 189,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 46,
    'date': new Date('2023.11.18'),
    'categoryId': 8,
    'item': 'Balance',
    'priceAmount': 27.3,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 47,
    'date': new Date('2023.11.19'),
    'categoryId': 8,
    'item': 'Little Bay',
    'priceAmount': 2300,
    'priceCurrencyId': 1,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 48,
    'date': new Date('2023.11.19'),
    'categoryId': 9,
    'item': 'Artist',
    'priceAmount': 570,
    'priceCurrencyId': 1,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 49,
    'date': new Date('2023.11.19'),
    'categoryId': 4,
    'item': 'Aman',
    'priceAmount': 79.99,
    'priceCurrencyId': 1,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 50,
    'date': new Date('2023.11.19'),
    'categoryId': 5,
    'item': 'Miami Sushi',
    'priceAmount': 2280,
    'priceCurrencyId': 1,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 51,
    'date': new Date('2023.11.19'),
    'categoryId': 7,
    'item': 'Wine Vision',
    'priceAmount': 1400,
    'priceCurrencyId': 1,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 52,
    'date': new Date('2023.11.19'),
    'categoryId': 8,
    'item': 'Repubblika',
    'priceAmount': 650,
    'priceCurrencyId': 1,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 53,
    'date': new Date('2023.11.20'),
    'categoryId': 11,
    'item': 'DM',
    'priceAmount': 504,
    'priceCurrencyId': 1,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 54,
    'date': new Date('2023.11.20'),
    'categoryId': 2,
    'item': 'Hleb i kifle',
    'priceAmount': 410,
    'priceCurrencyId': 1,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 55,
    'date': new Date('2023.11.20'),
    'categoryId': 9,
    'item': 'Flat',
    'priceAmount': 1800,
    'priceCurrencyId': 1,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 56,
    'date': new Date('2023.11.20'),
    'categoryId': 8,
    'item': 'Ovo bistro',
    'priceAmount': 4000,
    'priceCurrencyId': 1,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 57,
    'date': new Date('2023.11.20'),
    'categoryId': 8,
    'item': 'Milky',
    'priceAmount': 1290,
    'priceCurrencyId': 1,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 58,
    'date': new Date('2023.11.20'),
    'categoryId': 3,
    'item': 'Dental Simina',
    'priceAmount': 22000,
    'priceCurrencyId': 1,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 59,
    'date': new Date('2023.11.21'),
    'categoryId': 8,
    'item': 'Pasta e Vino',
    'priceAmount': 43.8,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 60,
    'date': new Date('2023.11.21'),
    'categoryId': 7,
    'item': 'MAE',
    'priceAmount': 21.6,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 61,
    'date': new Date('2023.11.21'),
    'categoryId': 4,
    'item': 'Dufry',
    'priceAmount': 200,
    'priceCurrencyId': 1,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 62,
    'date': new Date('2023.11.22'),
    'categoryId': 11,
    'item': 'Sephora',
    'priceAmount': 89.25,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 63,
    'date': new Date('2023.11.22'),
    'categoryId': 3,
    'item': 'Farmacia',
    'priceAmount': 25.6,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 64,
    'date': new Date('2023.11.22'),
    'categoryId': 12,
    'item': 'Tezenis',
    'priceAmount': 31.18,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 65,
    'date': new Date('2023.11.22'),
    'categoryId': 4,
    'item': 'CarreFour',
    'priceAmount': 9.92,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 66,
    'date': new Date('2023.11.22'),
    'categoryId': 9,
    'item': 'Bialetti',
    'priceAmount': 50.9,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 67,
    'date': new Date('2023.11.22'),
    'categoryId': 17,
    'item': 'Pastasciutta',
    'priceAmount': 16.5,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 68,
    'date': new Date('2023.11.22'),
    'categoryId': 7,
    'item': 'Postcards',
    'priceAmount': 5,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 69,
    'date': new Date('2023.11.22'),
    'categoryId': 18,
    'item': 'Apple',
    'priceAmount': 1745,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 70,
    'date': new Date('2023.11.22'),
    'categoryId': 8,
    'item': 'Dar Poeta',
    'priceAmount': 22,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 71,
    'date': new Date('2023.11.23'),
    'categoryId': 8,
    'item': 'Pasta e Vino',
    'priceAmount': 45,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 72,
    'date': new Date('2023.11.23'),
    'categoryId': 8,
    'item': 'Hard Rock',
    'priceAmount': 25,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 73,
    'date': new Date('2023.11.23'),
    'categoryId': 10,
    'item': 'Enotrevi',
    'priceAmount': 71.5,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 74,
    'date': new Date('2023.11.23'),
    'categoryId': 9,
    'item': 'Faro',
    'priceAmount': 28,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 75,
    'date': new Date('2023.11.24'),
    'categoryId': 17,
    'item': "McDonald's",
    'priceAmount': 7.5,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 76,
    'date': new Date('2023.11.24'),
    'categoryId': 18,
    'item': 'Apple',
    'priceAmount': 99,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 77,
    'date': new Date('2023.11.25'),
    'categoryId': 16,
    'item': 'City Tax',
    'priceAmount': 48,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 78,
    'date': new Date('2023.11.25'),
    'categoryId': 16,
    'item': 'Transfer',
    'priceAmount': 70,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 79,
    'date': new Date('2023.11.25'),
    'categoryId': 8,
    'item': 'Balance',
    'priceAmount': 23.3,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 80,
    'date': new Date('2023.11.25'),
    'categoryId': 4,
    'item': 'Konzum',
    'priceAmount': 19.94,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 81,
    'date': new Date('2023.11.25'),
    'categoryId': 4,
    'item': 'Muller',
    'priceAmount': 22.95,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 82,
    'date': new Date('2023.11.25'),
    'categoryId': 10,
    'item': 'Vrutak',
    'priceAmount': 17.49,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 83,
    'date': new Date('2023.11.25'),
    'categoryId': 3,
    'item': 'Ljekarna',
    'priceAmount': 19.9,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 84,
    'date': new Date('2023.11.25'),
    'categoryId': 11,
    'item': 'DM',
    'priceAmount': 13.05,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 85,
    'date': new Date('2023.11.25'),
    'categoryId': 4,
    'item': 'Duty Free',
    'priceAmount': 10.4,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 86,
    'date': new Date('2023.11.25'),
    'categoryId': 8,
    'item': 'Submarine',
    'priceAmount': 24.09,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 87,
    'date': new Date('2023.11.25'),
    'categoryId': 8,
    'item': 'Eataly',
    'priceAmount': 17,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 88,
    'date': new Date('2023.11.26'),
    'categoryId': 9,
    'item': "Eli's caffe",
    'priceAmount': 5,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 89,
    'date': new Date('2023.11.26'),
    'categoryId': 4,
    'item': 'Spar',
    'priceAmount': 11.22,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 90,
    'date': new Date('2023.11.26'),
    'categoryId': 6,
    'item': 'Dolac',
    'priceAmount': 23,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 91,
    'date': new Date('2023.11.26'),
    'categoryId': 1,
    'item': 'Zalando',
    'priceAmount': 182.94,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 92,
    'date': new Date('2023.11.27'),
    'categoryId': 4,
    'item': 'Cromaris',
    'priceAmount': 5.03,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 93,
    'date': new Date('2023.11.28'),
    'categoryId': 4,
    'item': 'Konzum',
    'priceAmount': 6.58,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 94,
    'date': new Date('2023.11.29'),
    'categoryId': 4,
    'item': 'Konzum',
    'priceAmount': 20.42,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    'id': 95,
    'date': new Date('2023.11.29'),
    'categoryId': 11,
    'item': 'DM',
    'priceAmount': 13.95,
    'priceCurrencyId': 3,
    'tenant': 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    'id': 96,
    'date': new Date('2023.11.29'),
    'categoryId': 19,
    'item': 'Harissa',
    'priceAmount': 9.44,
    'priceCurrencyId': 3,
    'tenant': '22a11263-56da-4327-98b7-f99d6591ac3c'
  }
]

function getSharedUserModel(friendsIds: number[], user: UserEntity, currentUserId: number): PolyUser {
  if (friendsIds.includes(Number(user.id))) {
    return userEntityToModel(user);
  }

  const relatedConnection = userConnections.find((c) => ((c.requestorUserId === currentUserId && c.targetUserId === user.id) || (c.requestorUserId === user.id && c.targetUserId === currentUserId)) && !c.accepted);

  return relatedConnection?.targetUserId === currentUserId
    ? userEntityToModel(user)
    : { id: user.id };
}
