import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExpansesPageComponent } from './pages/expanses-page/expanses-page.component';
import { Routes, RouterModule } from '@angular/router';
import { ExpansesTableComponent } from './components/expenses-table/expenses-table.component';
import { ComponentsModule } from '@app/components/components.module';
import { ExpensesResolver } from './expenses.resolver';

const routes: Routes = [
  {
    path: '',
    component: ExpansesPageComponent,
    resolve: {
      expenses: ExpensesResolver,
    }
  },
];

@NgModule({
  declarations: [ExpansesPageComponent, ExpansesTableComponent],
  imports: [CommonModule, RouterModule.forChild(routes), ComponentsModule]
})
export class ExpensesModule {}
