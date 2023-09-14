import { Request, Response } from 'express';
import { AddExpenseParams } from '../models/add-expense-params.model';
import { ControllerBase } from './controller-base';
import { DataContext } from '../data/data-context';
import { Expense } from '../models/expense.model';
import FuzzySearch from 'fuzzy-search';

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
    const newExpense = {
      id: maxId + 1,
      date: new Date(req.body.date),
      item: req.body.item,
      category: this.dataContext.categories.find(c => c.id == req.body.categoryId),
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
    res.send(this.wrapData([... new Set(this.itemsSearcher.search(req.body).map((e) => e.item))]));
  }
}
