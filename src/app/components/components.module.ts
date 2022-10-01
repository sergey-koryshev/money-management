import { TableModule } from './table/table.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyComponent } from './currency/currency.component';
import { UserAvatarComponent } from './user-avatar/user-avatar.component';
import { TableComponent } from './table/table.component';
import { PriceComponent } from './price/price.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    CurrencyComponent,
    UserAvatarComponent,
    PriceComponent,
  ],
  imports: [
    CommonModule,
    NgbModule,
    TableModule
  ],
  exports: [
    UserAvatarComponent,
    CurrencyComponent,
    PriceComponent,
    TableComponent
  ],
})
export class ComponentsModule { }
