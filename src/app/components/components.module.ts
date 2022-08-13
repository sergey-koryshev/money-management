import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyComponent } from './currency/currency.component';
import { UserAvatarComponent } from './user-avatar/user-avatar.component';

@NgModule({
  declarations: [
    CurrencyComponent,
    UserAvatarComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    UserAvatarComponent,
    CurrencyComponent
  ],
})
export class ComponentsModule { }
