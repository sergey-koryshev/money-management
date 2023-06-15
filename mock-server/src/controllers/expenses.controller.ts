import { Response, Request } from 'express';
import { DataContext } from '../data/data-context';
import { AddExpenseParams } from '../models/add-expense-params';

export class ExpensesController {
  constructor(private dataContext: DataContext) {}

  public getExpenses = (_: Request, res: Response) => {
    res.send(this.wrapData(this.dataContext.exchangedExpenses));
  }

  public addNewExpense = (req: Request<AddExpenseParams>, res: Response) => {
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
      date: req.body.date,
      item: req.body.item,
      price: {
        amount: req.body.priceAmount,
        currency: this.dataContext.currencies.find((c) => c.id === req.body.currencyId) ?? this.dataContext.currencies[0]
      }
    };
    this.dataContext.expenses.push(newExpense);
    this.dataContext.recalculateExchangedExpenses();
    res.send(this.wrapData(this.dataContext.exchangedExpenses.find((e) => e.id === maxId + 1)));
  }

  private wrapData(data: any) {
    return {
      data
    }
  }
}