import { ComponentsModule } from '@app/components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from './navbar/navbar.component';
import { AppRoutingModule } from '@app/app-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LoginModule } from '@app/modules/login/login.module';
import { NoticesDialogComponent } from './notice-dialog/notice-dialog.component';
import { AlertComponent } from './alert/alert.component';

@NgModule({
  declarations: [NavbarComponent, NoticesDialogComponent, AlertComponent],
  exports: [NavbarComponent, AlertComponent],
  imports: [
    CommonModule, ReactiveFormsModule, AppRoutingModule, ComponentsModule, NgbModule, LoginModule
  ]
})
export class LayoutModule { }
