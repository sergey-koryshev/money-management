import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExpensesPageComponent } from './pages/expenses-page/expenses-page.component';
import { Routes, RouterModule } from '@angular/router';
import { ExpensesTableComponent } from './components/expenses-table/expenses-table.component';
import { ComponentsModule } from '@app/components/components.module';
import { ExpensesResolver } from './expenses.resolver';
import { AddNewExpenseComponent } from './components/add-new-expense/add-new-expense.component';

const routes: Routes = [
  {
    path: '',
    component: ExpensesPageComponent,
    resolve: {
      expenses: ExpensesResolver,
    }
  },
];

@NgModule({
  declarations: [ExpensesPageComponent, ExpensesTableComponent, AddNewExpenseComponent],
  imports: [CommonModule, RouterModule.forChild(routes), ComponentsModule]
})
export class ExpensesModule {}
