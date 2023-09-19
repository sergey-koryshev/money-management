import { ExpensesController } from '../controllers/expenses.controller';
import { RouterBase } from './router-base';

export class ExpensesRouter extends RouterBase<ExpensesController> {
  initialize(): void {
    this.router.get('/', this.controller.getExpenses);
    this.router.post('/', this.controller.addNewExpense);
    this.router.post('/items', this.controller.getExistingItems);
    this.router.delete('/:id', this.controller.removeExpense);
  }
}

