import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './guards/auth-guard.service';
import { HomePageGuardService } from './guards/home-page-guard.service';

const routes: Routes = [
  {
    path: '',
    canActivate: [HomePageGuardService],
    loadChildren: () => import('./modules/home/home.module').then((module) => module.HomeModule)
  },
  {
    path: 'expenses',
    canActivate: [AuthGuardService],
    loadChildren: () => import('./modules/expenses/expenses.module').then((module) => module.ExpensesModule)
  },
  {
    path: 'signin',
    loadChildren: () => import('./modules/login/login.module').then((module) => module.LoginModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
  providers: [AuthGuardService, HomePageGuardService]
})
export class AppRoutingModule { }
