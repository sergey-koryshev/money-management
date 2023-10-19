import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { ComponentsModule } from '@app/components/components.module';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: LoginPageComponent
  }
]

@NgModule({
  declarations: [
    LoginFormComponent,
    LoginPageComponent
  ],
  imports: [
    CommonModule, ComponentsModule, ReactiveFormsModule, RouterModule.forChild(routes)
  ]
})
export class LoginModule { }
