import { TableModule } from './table/table.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyComponent } from './currency/currency.component';
import { UserAvatarComponent } from './user-avatar/user-avatar.component';
import { TableComponent } from './table/table.component';
import { PriceComponent } from './price/price.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RoundButtonComponent } from './round-button/round-button.component';
import { ModalDialogComponent } from './modal-dialog/modal-dialog.component';

@NgModule({
  declarations: [
    CurrencyComponent,
    UserAvatarComponent,
    PriceComponent,
    RoundButtonComponent,
    ModalDialogComponent,
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
    TableComponent,
    RoundButtonComponent,
    ModalDialogComponent
  ],
})
export class ComponentsModule { }
