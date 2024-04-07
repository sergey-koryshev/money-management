import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'parenthesesPipe'
})
export class ParenthesesPipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    return value ? `(${value})` : '';
  }
}
