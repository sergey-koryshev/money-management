import { Router } from 'express';
import { DataContext } from "../data/data-context";
import { RouterBase } from "./router-base";
import { ExpensesController } from '../controllers/expenses.controller';

export class ExpensesRouter extends RouterBase<ExpensesController> {
  initialize(): void {
    this.router.get('/', this.controller.getExpenses);
    this.router.post('/', this.controller.addNewExpense);
  }
}

