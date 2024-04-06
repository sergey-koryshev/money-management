import { CurrenciesController } from '../controllers/currencies.controller';
import { RouterBase } from './router-base';
import { auth } from '../middleware/auth.middleware';

export class CurrenciesRouter extends RouterBase<CurrenciesController> {
  initialize(): void {
    this.router.use(auth);
    this.router.get('/', this.controller.getCurrencies);
    this.router.get('/main', this.controller.getMainCurrency);
    this.router.post('/main', this.controller.setMainCurrency);
    this.router.delete('/main', this.controller.removeMainCurrency);
  }
}

