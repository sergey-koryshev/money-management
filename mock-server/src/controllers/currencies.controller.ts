import { Request, Response } from 'express';
import { ControllerBase } from './controller-base';
import { Currency } from '../models/currency.model';
import { SetMainCurrencyParams } from '../models/set-main-currency-params.model';
import { currencyEntityToModel } from '../data/currencies.data';

export class CurrenciesController extends ControllerBase {
  public getCurrencies = (_: Request, res: Response) => {
    this.sendData(res, this.dataContext.currenciesDbSet.map(currencyEntityToModel));
  }

  public getMainCurrency = (req: Request, res: Response) => {
    const mainCurrency = this.dataContext.getMainCurrency(req.userTenant);
    this.sendData(res, mainCurrency ? this.getCurrencyById(mainCurrency.currencyId) : null);
  }

  public setMainCurrency = (req: Request<unknown, unknown, SetMainCurrencyParams>, res: Response) => {
    if (!req.body) {
      res.sendStatus(500);
      return;
    }
    const index = this.dataContext.mainCurrenciesDbSet.findIndex((m) => m.tenant === req.userTenant);

    if (index >= 0) {
      this.dataContext.mainCurrenciesDbSet[index].currencyId = req.body.currencyId;
    } else {
      this.dataContext.addEntity({
        currencyId: req.body.currencyId,
        tenant: req.userTenant
      }, this.dataContext.mainCurrenciesDbSet)
    }

    const currency = this.getCurrencyById(req.body.currencyId);

    this.sendData(res, currency);
  }

  public removeMainCurrency = (req: Request<Currency>, res: Response) => {
    const index = this.dataContext.mainCurrenciesDbSet.findIndex((m) => m.tenant === req.userTenant);
    this.dataContext.mainCurrenciesDbSet.splice(index, 1);
    this.sendData(res, null);
  }

  private getCurrencyById (id: number): Currency {
    const entity = this.dataContext.currenciesDbSet.find((c) => c.id === id);

    if (!entity) {
      throw new Error(`Currency with Id ${id} doesn't exist`)
    }

    return currencyEntityToModel(entity);
  }
}
