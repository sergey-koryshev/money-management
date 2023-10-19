import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'expenses',
    loadChildren: () => import('./modules/expenses/expenses.module').then((module) => module.ExpensesModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./modules/login/login.module').then((module) => module.LoginModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
