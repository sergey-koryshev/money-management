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
import { UserTileComponent } from './user-tile/user-tile.component';
import { PillButtonComponent } from './pill-button/pill-button.component';
import { ParenthesesPipe } from './parentheses-pipe/parentheses.pipe';
import { StickyFiltersComponent } from "@components/sticky-filters/sticky-filters.component";
import { NgSelectModule } from "@ng-select/ng-select";
import { StickyFiltersModule } from "@components/sticky-filters/sticky-filters.module";
import { PipesModule } from "@app/pipes/pipes.module";

@NgModule({
  declarations: [
    CurrencyComponent,
    UserAvatarComponent,
    PriceComponent,
    RoundButtonComponent,
    ModalDialogComponent,
    UserTileComponent,
    PillButtonComponent,
    ParenthesesPipe,
    StickyFiltersComponent
  ],
  imports: [
    CommonModule,
    NgbModule,
    TableModule,
    NgSelectModule,
    StickyFiltersModule,
    PipesModule
  ],
  exports: [
    UserAvatarComponent,
    UserTileComponent,
    CurrencyComponent,
    PriceComponent,
    TableComponent,
    RoundButtonComponent,
    ModalDialogComponent,
    PillButtonComponent,
    ParenthesesPipe,
    StickyFiltersComponent
  ],
})
export class ComponentsModule { }
