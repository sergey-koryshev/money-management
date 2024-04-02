import { Request, Response } from 'express';
import { AddExpenseParams } from '../models/add-expense-params.model';
import { ControllerBase } from './controller-base';
import { EditExpenseParams } from '../models/edit-expense-params,model';
import { Expense } from '../models/expense.model';
import { ExpenseEntity } from '../data/entities/expense.entity';
import { ExpenseViewType } from '../models/expense-view-type.enum';
import FuzzySearch from 'fuzzy-search';
import { ItemWithCategory } from '../models/item-with-category.model';
import { categoryEntityToModel } from '../data/categories.data';
import { expenseEntityToModel } from '../data/expenses.data';

export class ExpensesController extends ControllerBase {
  public getExpenses = (req: Request, res: Response) => {
    const month = req.query['month'];
    const year = req.query['year'];
    const viewType = req.query['viewType'] == null
      ? ExpenseViewType.All
      : Number(req.query['viewType']);

    if (!month && !year) {
      this.sendError(res, 500, 'Month and year must be specified');
    }

    this.sendData(res, this.getFilteredExpenses(Number(month), Number(year), req.userTenant, viewType));
  }

  public addNewExpense = (req: Request<unknown, unknown, AddExpenseParams>, res: Response) => {
    const category = req.body.category
      ? this.createOrGetCategory(req.body.category.id, req.body.category.name, req.userTenant)
      : undefined;

    const currentUser = this.dataContext.getUser(req.userTenant);

    const newExpense = this.dataContext.addEntity({
      date: new Date(req.body.date),
      item: req.body.item,
      description: req.body.description,
      categoryId: category?.id,
      priceAmount: req.body.priceAmount,
      priceCurrencyId: req.body.currencyId,
      tenant: req.userTenant
    }, this.dataContext.expensesDbSet);

    const notAcceptedConnections: number[] = [];
    const notExistingConnections: number[] = [];

    req.body.sharedWith?.forEach((userId) => {
      const existingConnection = this.dataContext.userConnectionsDbSet
        .find((c) => ((c.requestorUserId === currentUser.id && c.targetUserId === userId)
          || (c.requestorUserId === userId && c.targetUserId === currentUser.id)));

      if (!existingConnection) {
        notExistingConnections.push(userId);
      } else if (!existingConnection.accepted) {
        notAcceptedConnections.push(userId);
      }
    });

    if (notAcceptedConnections.length > 0 || notExistingConnections.length > 0) {
      return this.sendError(res, 500, 'The expense can be shared only with user you have accepted connection with');
    }

    req.body.sharedWith?.forEach((userId) => this.addSharingInformation(newExpense.id, userId));

    this.sendData(res, expenseEntityToModel(newExpense));
  }

  public getExistingItems = (req: Request<unknown, unknown, string>, res: Response) => {
    let result: ItemWithCategory[] = [];
    const itemsSearcher = new FuzzySearch<Expense>(this.dataContext.getExpenses(req.userTenant), ['item'])

    if (req.body != null && req.body.length > 0) {
      result = itemsSearcher
      .search(req.body)
      .filter((v, i, s) => s.findIndex(o => o.item === v.item && o.category?.id === v.category?.id) === i)
      .map((e) => ({ item: e.item, category: e.category}));
    }

    this.sendData(res, result);
  }

  public removeExpense = (req: Request, res: Response) => {
    const user = this.dataContext.getUser(req.userTenant);
    const expense = this.dataContext.getExpenses(req.userTenant).find(e => e.id === Number(req.params['id']));

    if (expense?.id == null) {
      throw new Error(`Expense with id ${req.params['id']} doesn't exist`)
    }

    const shareIndex = this.dataContext.expensesToUsersDbSet.findIndex((e) => e.expenseId === expense.id && e.userId === user.id);

    if (shareIndex >= 0) {
      this.dataContext.expensesToUsersDbSet.splice(shareIndex, 1);
    } else {
      const allShares = this.dataContext.expensesToUsersDbSet.filter((e) => e.expenseId === expense.id);

      allShares.forEach((s) => {
        this.removeSharingInformation(s.expenseId, s.userId);
      });

      this.dataContext.removeEntity(expense.id, this.dataContext.expensesDbSet);
    }

    return this.sendData(res, expense);
  }

  public editExpense = (req: Request<unknown, unknown, EditExpenseParams>, res: Response) => {
    const expense = this.dataContext.getExpenses(req.userTenant).find(e => e.id === Number(req.body.id));

    if (expense?.id == null) {
      return this.sendError(res, 500, `Expense with id ${req.body.id} doesn't exist`);
    }

    const index = this.dataContext.expensesDbSet.findIndex(e => e.id === Number(req.body.id));

    const expenseEntity = this.dataContext.expensesDbSet[index]

    if (expenseEntity.tenant !== req.userTenant) {
      const creator = this.dataContext.getUser(expenseEntity.tenant);
      const currentUser = this.dataContext.getUser(req.userTenant);
      if (this.dataContext.userConnectionsDbSet.find((c) => ((c.requestorUserId === currentUser.id && c.targetUserId === creator.id) || (c.requestorUserId === creator.id && c.targetUserId === currentUser.id)) && c.accepted) == null) {
        return this.sendError(res, 500, 'You doesn\'t have permissions to edit the expense');
      }
    }

    const category = req.body.category
      ? this.createOrGetCategory(req.body.category.id, req.body.category.name, req.userTenant)
      : undefined;

    const editedExpense: ExpenseEntity = {
      ...expenseEntity,
      date: new Date(req.body.date),
      item: req.body.item,
      categoryId: category?.id,
      priceAmount: req.body.priceAmount,
      priceCurrencyId: req.body.currencyId,
      description: req.body.description
    };

    if (req.body.sharedWith) {
      const existingFriends = expense.sharedWith.map((u) => u.id);
      const friendsToDelete = existingFriends.length > 0
        ? existingFriends.filter((userId) => !req.body.sharedWith?.includes(Number(userId)))
        : [];
      const friendsToAdd = existingFriends.length > 0
        ? req.body.sharedWith.filter((userId) => existingFriends.includes(userId))
        : req.body.sharedWith;

      if (editedExpense.tenant !== req.userTenant && (friendsToAdd.length > 0 || friendsToDelete.length > 0)) {
        return this.sendError(res, 500, 'You cannot change users list the expense is shared with');
      }

      if (friendsToDelete.length > 0) {
        friendsToDelete.forEach((userId) => this.removeSharingInformation(Number(expense.id), Number(userId)));
      }

      if (friendsToAdd.length > 0) {
        friendsToAdd.forEach((userId) => this.addSharingInformation(Number(expense.id), Number(userId)));
      }
    }

    this.dataContext.expensesDbSet[index] = editedExpense;
    this.sendData(res, expenseEntityToModel(editedExpense, req.userTenant));
  }

  public searchItems = (req: Request, res: Response) => {
    let result: Expense[] = [];

    if (req.body != null && req.body.length > 0) {
      const itemsSearcher = new FuzzySearch<Expense>(this.dataContext.getExpenses(req.userTenant), ['item', 'description'])
      result = itemsSearcher.search(req.body);
    }

    this.sendData(res, result);
  }

  private getFilteredExpenses(month: number, year: number, tenant: string, viewType: ExpenseViewType) {
    return this.dataContext.getExpenses(tenant, viewType).filter((e) =>
      e.date.getMonth() + 1 == month && e.date.getFullYear() == year
    );
  }

  private createOrGetCategory(categoryId: number | undefined, categoryName: string, tenant: string) {
    const category = this.dataContext.getCategories(tenant).find(c => c.id == categoryId);

    if (category) {
      return category;
    }

    if (!categoryName) {
      throw new Error('Category name is not specified');
    }

    const newCategory = this.dataContext.addEntity({
      name: categoryName,
      tenant
    }, this.dataContext.categoriesDbSet);

    return categoryEntityToModel(newCategory);
  }

  private removeSharingInformation(expenseId: number, userId: number) {
    const index = this.dataContext.expensesToUsersDbSet.findIndex((e) => e.expenseId === expenseId && e.userId === userId);

    if (index >= 0) {
      this.dataContext.expensesToUsersDbSet.splice(index, 1);
    }
  }

  private addSharingInformation(expenseId: number, userId: number) {
    const index = this.dataContext.expensesToUsersDbSet.findIndex((e) => e.expenseId === expenseId && e.userId === userId);

    if (index < 0) {
      this.dataContext.expensesToUsersDbSet.push({
        expenseId,
        userId
      });
    }
  }
}
