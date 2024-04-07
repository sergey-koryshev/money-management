import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserConnectionsPageComponent } from './pages/user-connections-page/user-connections-page.component';
import { RouterModule, Routes } from '@angular/router';
import { UserConnectionsListComponent } from './components/user-connections-list/user-connections-list.component';
import { UserConnectionsResolver } from './user-connections.resolver';
import { AddNewConnectionDialogComponent } from './components/add-new-connection-dialog/add-new-connection-dialog.component';
import { ComponentsModule } from '@app/components/components.module';
import { FormsModule } from '@angular/forms';
import { UserConnectionCardComponent } from './components/user-connection-card/user-connection-card.component';

const routes: Routes = [
  {
    path: '',
    component: UserConnectionsPageComponent,
    resolve: {
      connections: UserConnectionsResolver,
    }
  }
]

@NgModule({
  declarations: [
    UserConnectionsPageComponent,
    UserConnectionsListComponent,
    AddNewConnectionDialogComponent,
    UserConnectionCardComponent
  ],
  imports: [
    CommonModule, ComponentsModule, FormsModule, RouterModule.forChild(routes)
  ],
  providers: [UserConnectionsResolver]
})
export class UserConnectionsModule { }
