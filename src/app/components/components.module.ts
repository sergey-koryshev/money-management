import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyComponent } from './currency/currency.component';
import { UserAvatarComponent } from './user-avatar/user-avatar.component';
import { TableComponent } from './table/table.component';

@NgModule({
  declarations: [
    CurrencyComponent,
    UserAvatarComponent,
    TableComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    UserAvatarComponent,
    CurrencyComponent,
    TableComponent
  ],
})
export class ComponentsModule { }
