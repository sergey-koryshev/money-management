import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{
  path: 'expenses',
  loadChildren: () => import('./modules/expenses/expenses.module').then((module) => module.ExpensesModule)
}];
// dummy change
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
