import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotNullKeyValuePipe } from "@app/pipes/not-null-keyvalue.pipe";

@NgModule({
  declarations: [
    NotNullKeyValuePipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    NotNullKeyValuePipe
  ]
})
export class PipesModule { }
