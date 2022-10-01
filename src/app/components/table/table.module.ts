import { TableComponent } from './table.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SortableHeaderDirective } from './sortable-header.directive';

@NgModule({
  declarations: [SortableHeaderDirective, TableComponent],
  imports: [
    CommonModule
  ],
  exports: [TableComponent]
})
export class TableModule { }
