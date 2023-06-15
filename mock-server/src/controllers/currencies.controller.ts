import { Response, Request } from 'express';
import { DataContext } from '../data/data-context';
import { Currency } from '../models/currency.model';

export class CurrenciesController {
  constructor(private dataContext: DataContext) {}

  public getCurrencies = (_: Request, res: Response) => {
    res.send(this.wrapData(this.dataContext.currencies));
  }

  public getMainCurrency = (_: Request, res: Response) => {
    res.send(this.wrapData(this.dataContext.mainCurrency));
  }

  public setMainCurrency = (req: Request<Currency>, res: Response) => {
    if (!req.body) {
      res.sendStatus(500);
      return;
    }
    this.dataContext.mainCurrency = req.body;
    this.dataContext.recalculateExchangedExpenses();
    res.send(this.wrapData(this.dataContext.mainCurrency));
  }

  public removeMainCurrency = (req: Request<Currency>, res: Response) => {
    this.dataContext.mainCurrency = null;
    this.dataContext.recalculateExchangedExpenses();
    res.send(this.wrapData({}));
  }

  private wrapData(data: any) {
    return {
      data
    }
  }
}
