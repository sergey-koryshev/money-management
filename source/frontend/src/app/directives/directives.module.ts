import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormControlNameDirective} from "@app/directives/form-control-name.directive";



@NgModule({
  declarations: [
    FormControlNameDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    FormControlNameDirective
  ]
})
export class DirectivesModule { }
