import { User } from '@models/user.model';
import { ComponentsModule } from '@app/components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from './navbar/navbar.component';
import { AppRoutingModule } from '@app/app-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NoticesDialogComponent } from './notice-dialog/notice-dialog.component';
import { AlertComponent } from './alert/alert.component';
import { FooterComponent } from './footer/footer.component';
import { UserConnectionsModule } from '@app/modules/user-connections/user-connections.module';
import { UserConnectionsDialogComponent } from './user-connections-dialog/user-connections-dialog.component';

@NgModule({
  declarations: [NavbarComponent, NoticesDialogComponent, AlertComponent, FooterComponent, UserConnectionsDialogComponent],
  exports: [NavbarComponent, AlertComponent, FooterComponent],
  imports: [
    CommonModule, ReactiveFormsModule, AppRoutingModule, ComponentsModule, NgbModule, UserConnectionsModule
  ]
})
export class LayoutModule { }
