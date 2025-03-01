import { Directive, Self } from '@angular/core';
import { FormControlName } from "@angular/forms";

@Directive({
  selector: '[formControlName]',
  exportAs: 'ngForm'
})
export class FormControlNameDirective extends FormControlName{
  constructor(@Self() formControlName: FormControlName) {
    super(null as any, null as any, null as any, null as any, null as any);
    return formControlName;
  }
}
