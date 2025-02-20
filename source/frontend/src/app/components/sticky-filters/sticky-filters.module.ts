import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StickyFilterComponent } from './components/sticky-filter/sticky-filter.component';
import { NgSelectModule } from "@ng-select/ng-select";
import { NgbDropdownModule, NgbModule } from "@ng-bootstrap/ng-bootstrap";

@NgModule({
  declarations: [
    StickyFilterComponent
  ],
  exports: [
    StickyFilterComponent
  ],
  imports: [
    CommonModule,
    NgSelectModule,
    NgbDropdownModule,
    NgbModule
  ]
})
export class StickyFiltersModule { }
