import { categories, categoryEntityToModel } from './categories.data';
import { expenseEntityToModel, expenses } from './expenses.data';
import { Identifier } from '../models/identifier.model';
import { currencies } from './currencies.data';
import { mainCurrencies } from './main-currencies.data';
import { userConnections } from './user-connections.data';
import { users } from './users.data';

export class DataContext {
  public expensesDbSet = expenses;
  public categoriesDbSet = categories;
  public mainCurrenciesDbSet = mainCurrencies;
  public userConnections = userConnections;

  public currenciesDbSet = currencies;
  public usersDbSet = users;

  public getExpenses(tenant: string) {
    return this.expensesDbSet.filter((e) => e.tenant === tenant).map(expenseEntityToModel);
  }

  public getCategories(tenant: string) {
    return this.categoriesDbSet.filter((e) => e.tenant === tenant).map(categoryEntityToModel);
  }

  public getMainCurrency(tenant: string) {
    return this.mainCurrenciesDbSet.find((m) => m.tenant === tenant);
  }

  public addEntity<T extends Identifier>(entity: T, dbSet: T[]) {
    const newId = this.getUniqueId(dbSet);
    const addingEntity = {...entity, id: newId};
    dbSet.push(addingEntity);
    return addingEntity;
  }

  private getUniqueId<T extends Identifier>(dbSet: T[]){
    return dbSet.reduce(
      (max, e) => (e.id
        ? e.id > max
          ? e.id
          : max
        : 0),
      0
    ) + 1;
  }
}
