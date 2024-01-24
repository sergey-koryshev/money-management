import { Request, Response } from 'express';
import { AddExpenseParams } from '../models/add-expense-params.model';
import { ControllerBase } from './controller-base';
import { Expense } from '../models/expense.model';
import { ExpenseEntity } from '../data/entities/expense.entity';
import FuzzySearch from 'fuzzy-search';
import { ItemWithCategory } from '../models/item-with-category.model';
import { categoryEntityToModel } from '../data/categories.data';
import { expenseEntityToModel } from '../data/expenses.data';

export class ExpensesController extends ControllerBase {
  public getExpenses = (req: Request, res: Response) => {
    const month = req.query['month'];
    const year = req.query['year'];

    if (!month && !year) {
      this.sendError(res, 500, 'Month and year must be specified');
    }

    this.sendData(res, this.getFilteredExpenses(Number(month), Number(year), req.userTenant));
  }

  public addNewExpense = (req: Request<unknown, unknown, AddExpenseParams>, res: Response) => {
    const category = req.body.category
      ? this.createOrGetCategory(req.body.category.id, req.body.category.name, req.userTenant)
      : undefined;

    const newExpense = this.dataContext.addEntity({
      date: new Date(req.body.date),
      item: req.body.item,
      categoryId: category?.id,
      priceAmount: req.body.priceAmount,
      priceCurrencyId: req.body.currencyId,
      tenant: req.userTenant
    }, this.dataContext.expensesDbSet);

    this.sendData(res, expenseEntityToModel(newExpense));
  }

  public getExistingItems = (req: Request<unknown, unknown, string>, res: Response) => {
    let result: ItemWithCategory[] = [];
    const itemsSearcher = new FuzzySearch<Expense>(this.dataContext.getExpenses(req.userTenant), ['item'])

    if (req.body != null && req.body.length > 0) {
      result = itemsSearcher
      .search(req.body)
      .filter((v, i, s) => s.findIndex(o => o.item === v.item) === i)
      .map((e) => ({ item: e.item, categoryId: e.category?.id}));
    }

    this.sendData(res, result);
  }

  public removeExpense = (req: Request, res: Response) => {
    const expense = this.dataContext.getExpenses(req.userTenant).find(e => e.id === Number(req.params['id']));

    if (!expense) {
      throw new Error(`Expense with id ${req.params['id']} doesn't exist`)
    }

    const index = this.dataContext.expensesDbSet.findIndex(e => e.id === Number(req.params['id']));
    this.dataContext.expensesDbSet.splice(index, 1);
    this.sendData(res, expense);
  }

  public editExpense = (req: Request, res: Response) => {
    const expense = this.dataContext.getExpenses(req.userTenant).find(e => e.id === Number(req.body.id));

    if (!expense) {
      throw new Error(`Expense with id ${req.body.id} doesn't exist`)
    }

    const index = this.dataContext.expensesDbSet.findIndex(e => e.id === Number(req.body.id));

    const category = req.body.category
      ? this.createOrGetCategory(req.body.category.id, req.body.category.name, req.userTenant)
      : undefined;

    const editedExpense: ExpenseEntity = {
      id: req.body.id,
      date: new Date(req.body.date),
      item: req.body.item,
      categoryId: category?.id,
      priceAmount: req.body.priceAmount,
      priceCurrencyId: req.body.currencyId,
      tenant: expense.createdBy.tenant
    };

    this.dataContext.expensesDbSet[index] = editedExpense;
    this.sendData(res, expenseEntityToModel(editedExpense));
  }

  public searchItems = (req: Request, res: Response) => {
    let result: Expense[] = [];

    if (req.body != null && req.body.length > 0) {
      result = this.dataContext.getExpenses(req.userTenant).filter(e => e.item.toUpperCase() == req.body.toUpperCase())
    }

    this.sendData(res, result);
  }

  private getFilteredExpenses(month: number, year: number, tenant: string) {
    return this.dataContext.getExpenses(tenant).filter((e) =>
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
}
