import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExpensesPageComponent } from './pages/expenses-page/expenses-page.component';
import { Routes, RouterModule } from '@angular/router';
import { ExpensesTableComponent } from './components/expenses-table/expenses-table.component';
import { ComponentsModule } from '@app/components/components.module';
import { ExpensesResolver } from './expenses.resolver';
import { ExpenseFormComponent } from './components/expense-form/expense-form.component';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { AddNewExpenseDialogComponent } from './components/add-new-expense-dialog/add-new-expense-dialog.component';
import { EditExpenseDialogComponent } from './components/edit-expense-dialog/edit-expense-dialog.component';
import { SearchResultsComponent } from './pages/search-results/search-results.component';
import { SearchResultsResolver } from './search-results.resolver';

const routes: Routes = [
  {
    path: '',
    component: ExpensesPageComponent,
    resolve: {
      expensesView: ExpensesResolver,
    }
  },
  {
    path: 'search',
    runGuardsAndResolvers: 'always',
    component: SearchResultsComponent,
    resolve: {
      expenses: SearchResultsResolver
    }
  }
];

@NgModule({
  declarations: [ExpensesPageComponent, ExpensesTableComponent, ExpenseFormComponent, AddNewExpenseDialogComponent, EditExpenseDialogComponent, SearchResultsComponent],
  imports: [CommonModule, RouterModule.forChild(routes), ComponentsModule, ReactiveFormsModule, NgbDatepickerModule, NgSelectModule],
})
export class ExpensesModule {}
