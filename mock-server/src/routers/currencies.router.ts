import { Router } from 'express';
import { DataContext } from "../data/data-context";
import { RouterBase } from "./router-base";
import { CurrenciesController } from '../controllers/currencies.controller';

export class CurrenciesRouter extends RouterBase<CurrenciesController> {
  initialize(): void {
    this.router.get('/', this.controller.getCurrencies);
    this.router.get('/main', this.controller.getMainCurrency);
    this.router.post('/main', this.controller.setMainCurrency);
    this.router.delete('/main', this.controller.removeMainCurrency);
  }
}

