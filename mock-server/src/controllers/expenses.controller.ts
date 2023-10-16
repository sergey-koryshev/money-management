import { Request, Response } from 'express';
import { AddExpenseParams } from '../models/add-expense-params.model';
import { ControllerBase } from './controller-base';
import { DataContext } from '../data/data-context';
import { Expense } from '../models/expense.model';
import { ExpensesView } from '../models/expenses-view.model';
import FuzzySearch from 'fuzzy-search';
import { ItemWithCategory } from '../models/item-with-category.model';

export class ExpensesController extends ControllerBase {

  itemsSearcher: FuzzySearch<Expense>;

  constructor(dataContext: DataContext) {
    super(dataContext);
    this.itemsSearcher = new FuzzySearch<Expense>(dataContext.expenses, ['item'])
  }

  public getExpenses = (req: Request, res: Response) => {
    const month = req.query['month'];
    const year = req.query['year'];

    if (!month && !year) {
      res.sendStatus(500);
    }

    res.send(this.wrapData(this.getFilteredExpenses(Number(month), Number(year))));
  }

  public addNewExpense = (req: Request<unknown, unknown, AddExpenseParams>, res: Response) => {
    const maxId = this.dataContext.expenses.reduce(
      (max, e) => (e.id
        ? e.id > max
          ? e.id
          : max
        : 0),
      0
    );

    const category = req.body.category
      ? this.createOrGetCategory(req.body.category.id, req.body.category.name)
      : undefined;

    const newExpense = {
      id: maxId + 1,
      date: new Date(req.body.date),
      item: req.body.item,
      category: category,
      price: {
        amount: req.body.priceAmount,
        currency: this.dataContext.currencies.find((c) => c.id === req.body.currencyId) ?? this.dataContext.currencies[0]
      }
    };
    this.dataContext.expenses.push(newExpense);
    this.dataContext.recalculateExchangedExpenses();
    res.send(this.wrapData(this.dataContext.exchangedExpenses.find((e) => e.id === maxId + 1)));
  }

  public getExistingItems = (req: Request<unknown, unknown, string>, res: Response) => {
    let result: ItemWithCategory[] = [];

    if (req.body != null && req.body.length > 0) {
      result = this.itemsSearcher
      .search(req.body)
      .filter((v, i, s) => s.findIndex(o => o.item === v.item) === i)
      .map((e) => ({ item: e.item, categoryId: e.category?.id}));
    }

    res.send(this.wrapData(result));
  }

  public removeExpense = (req: Request, res: Response) => {
    const index = this.dataContext.expenses.findIndex(e => e.id === Number(req.params['id']));
    const deletingItem = this.dataContext.expenses[index];
    this.dataContext.expenses.splice(index, 1);
    this.dataContext.recalculateExchangedExpenses();
    res.send(this.wrapData(deletingItem));
  }

  public editExpense = (req: Request, res: Response) => {
    const index = this.dataContext.expenses.findIndex(e => e.id === Number(req.body.id));

    const category = req.body.category
      ? this.createOrGetCategory(req.body.category.id, req.body.category.name)
      : undefined;

    const editedExpense = {
      id: req.body.id,
      date: new Date(req.body.date),
      item: req.body.item,
      category: category,
      price: {
        amount: req.body.priceAmount,
        currency: this.dataContext.currencies.find((c) => c.id === req.body.currencyId) ?? this.dataContext.currencies[0]
      }
    };

    this.dataContext.expenses[index] = editedExpense;
    this.dataContext.recalculateExchangedExpenses();
    const exchangedIndex = this.dataContext.exchangedExpenses.findIndex(e => e.id === Number(req.body.id));
    res.send(this.wrapData(this.dataContext.exchangedExpenses[exchangedIndex]));
  }

  public searchItems = (req: Request, res: Response) => {
    let result: Expense[] = [];

    if (req.body != null && req.body.length > 0) {
      result = this.dataContext.exchangedExpenses.filter(e => e.item.toUpperCase() == req.body.toUpperCase())
    }

    res.send(this.wrapData(result));
  }

  public getExpensesView = (req: Request, res: Response) => {
    const result: ExpensesView = {
      expenses: [],
      total: undefined
    };

    const month = req.query['month'];
    const year = req.query['year'];

    if (!month && !year) {
      res.sendStatus(500);
    }

    const monthNumber = Number(month);
    const yearNumber = Number(year);

    result.expenses = this.getFilteredExpenses(monthNumber, yearNumber);

    if (this.dataContext.mainCurrency) {
      result.total = {
        amount: this.getTotalSpent(monthNumber, yearNumber),
        currency: this.dataContext.mainCurrency
      }
    }

    res.send(this.wrapData(result))
  }

  private getFilteredExpenses(month: number, year: number) {
    return this.dataContext.exchangedExpenses.filter((e) =>
      e.date.getMonth() + 1 == Number(month) && e.date.getFullYear() == Number(year)
    );
  }

  private getTotalSpent(month: number, year: number) {
    return this.getFilteredExpenses(month, year).reduce((sum, current) => sum + (current.exchangedPrice?.amount ?? current.price.amount), 0)
  }

  private createOrGetCategory(categoryId: number | undefined, categoryName: string) {
    const maxCategoryId = this.dataContext.categories.reduce(
      (max, e) => (e.id
        ? e.id > max
          ? e.id
          : max
        : 0),
      0
    );

    const category = this.dataContext.categories.find(c => c.id == categoryId);

    if (category) {
      return category;
    }

    if (!categoryName) {
      throw new Error('Category name is not specified');
    }

    const newCategory = {
      id: maxCategoryId + 1,
      name: categoryName
    };
    this.dataContext.categories.push(newCategory);
    return newCategory;
  }
}
