import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './guards/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'expenses',
    pathMatch: 'full'
  },
  {
    path: 'expenses',
    canActivate: [AuthGuardService],
    loadChildren: () => import('./modules/expenses/expenses.module').then((module) => module.ExpensesModule)
  },
  {
    path: 'signin',
    loadChildren: () => import('./modules/login/login.module').then((module) => module.LoginModule)
  },
  {
    path: 'connections',
    canActivate: [AuthGuardService],
    loadChildren: () => import('./modules/user-connections/user-connections.module').then((module) => module.UserConnectionsModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
  providers: [AuthGuardService]
})
export class AppRoutingModule { }
