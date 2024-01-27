import { categories, categoryEntityToModel } from './categories.data';
import { expenseEntityToModel, expenses } from './expenses.data';
import { Identifier } from '../models/identifier.model';
import { currencies } from './currencies.data';
import { expensesToUsers } from './expense-to-users.data';
import { mainCurrencies } from './main-currencies.data';
import { userConnections } from './user-connections.data';
import { users } from './users.data';

export class DataContext {
  public expensesDbSet = expenses;
  public categoriesDbSet = categories;
  public mainCurrenciesDbSet = mainCurrencies;
  public userConnectionsDbSet = userConnections;
  public expensesToUsersDbSet = expensesToUsers;

  public currenciesDbSet = currencies;
  public usersDbSet = users;

  public getExpenses(tenant: string) {
    const user = this.getUser(tenant);
    const userExpenses = this.expensesDbSet.filter((e) => e.tenant === tenant).map((e) => expenseEntityToModel(e));
    const sharedExpenseIds = this.expensesToUsersDbSet.filter((e) => e.userId === user.id).map((e) => e.expenseId);
    const sharedExpenses = this.expensesDbSet.filter((e) => {
      if (!e.id) {
        return false;
      }

      return sharedExpenseIds.includes(e.id)
    }).map((e) => expenseEntityToModel(e, tenant));

    return [...userExpenses, ...sharedExpenses];
  }

  public getCategories(tenant: string) {
    const user = this.getUser(tenant);
    const userCategories = this.categoriesDbSet.filter((e) => e.tenant === tenant).map(categoryEntityToModel);
    const sharedExpenseIds = this.expensesToUsersDbSet.filter((e) => e.userId === user.id).map((e) => e.expenseId);
    const sharedCategoriesIds = [... new Set(this.expensesDbSet.filter((e) => {
      if (!e.id) {
        return false;
      }

      return e.categoryId != null && sharedExpenseIds.includes(e.id)
    }).map((e) => e.categoryId))];
    const sharedCategories = this.categoriesDbSet.filter((c) => sharedCategoriesIds.includes(c.id)).map(categoryEntityToModel);

    return [...userCategories, ...sharedCategories];
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

  public removeEntity<T extends Identifier>(id: number, dbSet: T[]) {
    const entityIndex = dbSet.findIndex((e) => e.id === id);

    if (entityIndex < 0) {
      throw new Error(`Entity with id ${id} doesn't exist`);
    }

    const removingEntity = dbSet[entityIndex];
    dbSet.splice(entityIndex, 1);
    return removingEntity;
  }

  public getUser(tenant: string) {
    const user = users.find((u) => u.tenant === tenant);

    if (!user) {
      throw new Error(`User with tenant ${tenant} doesn't exist`);
    }

    return user;
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
