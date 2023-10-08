import { Request, Response } from 'express';
import { AddExpenseParams } from '../models/add-expense-params.model';
import { Category } from '../models/category.model';
import { ControllerBase } from './controller-base';
import { DataContext } from '../data/data-context';
import { Expense } from '../models/expense.model';
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
    if (month && year) {
      res.send(this.wrapData(this.dataContext.exchangedExpenses.filter((e) =>
        e.date.getMonth() + 1 == Number(month) && e.date.getFullYear() == Number(year)
      )));
    } else {
      res.sendStatus(500);
    }
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
    const maxCategoryId = this.dataContext.categories.reduce(
      (max, e) => (e.id
        ? e.id > max
          ? e.id
          : max
        : 0),
      0
    );

    let category: Category | undefined;

    if (req.body.category != null) {
      if (req.body.category.id != null) {
        category = this.dataContext.categories.find(c => c.id == req.body.category?.id);
      } else {
        const newCategoryArrayId = this.dataContext.categories.push({
          id: maxCategoryId + 1,
          name: req.body.category.name
        });
        category = this.dataContext.categories[newCategoryArrayId - 1];
      }
    }

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

    const maxCategoryId = this.dataContext.categories.reduce(
      (max, e) => (e.id
        ? e.id > max
          ? e.id
          : max
        : 0),
      0
    );

    let category: Category | undefined;

    if (req.body.category != null) {
      if (req.body.category.id != null) {
        category = this.dataContext.categories.find(c => c.id == req.body.category?.id);
      } else {
        const newCategoryArrayId = this.dataContext.categories.push({
          id: maxCategoryId + 1,
          name: req.body.category.name
        });
        category = this.dataContext.categories[newCategoryArrayId - 1];
      }
    }

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
}
