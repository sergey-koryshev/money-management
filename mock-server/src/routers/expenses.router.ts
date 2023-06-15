import { Router } from 'express';
import { DataContext } from "../data/data-context";
import { RouterBase } from "../models/router-base.model";
import { ExpensesController } from '../controllers/expenses.controller';

export class ExpensesRouter implements RouterBase {
  private controller: ExpensesController;
  router: Router;

  constructor(dataContext: DataContext) {
    this.controller = new ExpensesController(dataContext)
    this.router = Router();
    this.initialize();
  }

  private initialize() {
    this.router.get('/', this.controller.getExpenses);
    this.router.post('/', this.controller.addNewExpense);
  }
}

