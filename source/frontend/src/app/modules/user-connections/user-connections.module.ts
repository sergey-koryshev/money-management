import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserConnectionsListComponent } from './components/user-connections-list/user-connections-list.component';
import { UserConnectionsResolver } from './user-connections.resolver';
import { AddNewConnectionFormComponent } from './components/add-new-connection-form/add-new-connection-form.component';
import { ComponentsModule } from '@app/components/components.module';
import { FormsModule } from '@angular/forms';
import { UserConnectionCardComponent } from './components/user-connection-card/user-connection-card.component';
import { UserConnectionsComponent } from './components/user-connections/user-connections.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [
    UserConnectionsListComponent,
    AddNewConnectionFormComponent,
    UserConnectionCardComponent,
    UserConnectionsComponent
  ],
  imports: [
    CommonModule, ComponentsModule, FormsModule, NgbTooltipModule
  ],
  exports: [UserConnectionsComponent],
  providers: [UserConnectionsResolver]
})
export class UserConnectionsModule { }
