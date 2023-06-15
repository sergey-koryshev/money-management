import { Router } from 'express';
import { DataContext } from "../data/data-context";
import { RouterBase } from "../models/router-base.model";
import { CurrenciesController } from '../controllers/currencies.controller';

export class CurrenciesRouter implements RouterBase {
  private currencyController: CurrenciesController;
  router: Router;

  constructor(dataContext: DataContext) {
    this.currencyController = new CurrenciesController(dataContext)
    this.router = Router();
    this.initialize();
  }

  private initialize() {
    this.router.get('/', this.currencyController.getCurrencies);
    this.router.get('/main', this.currencyController.getMainCurrency);
    this.router.post('/main', this.currencyController.setMainCurrency);
    this.router.delete('/main', this.currencyController.removeMainCurrency);
  }
}

