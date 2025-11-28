import { TableComponent } from './table.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SortableHeaderDirective } from './sortable-header.directive';
import { NgbDropdownModule, NgbAccordionModule } from "@ng-bootstrap/ng-bootstrap";
import { ContextMenuModule } from '@perfectmemory/ngx-contextmenu';
import { RoundButtonModule } from '../round-button/round-button.module';

@NgModule({
  declarations: [SortableHeaderDirective, TableComponent],
  imports: [
    CommonModule,
    NgbDropdownModule,
    ContextMenuModule,
    NgbAccordionModule,
    RoundButtonModule
  ],
  exports: [TableComponent]
})
export class TableModule { }
