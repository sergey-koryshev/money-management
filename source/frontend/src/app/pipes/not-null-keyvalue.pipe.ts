import { Pipe, PipeTransform } from '@angular/core';
import { KeyValue } from "@angular/common";

@Pipe({
  name: 'notnullkeyvalue'
})
export class NotNullKeyValuePipe implements PipeTransform {
  transform<V>(items: Array<KeyValue<string | undefined, any | undefined>>): Array<KeyValue<string, any>> {
    return items.filter(item => item.key != null && item.value != null) as Array<KeyValue<string, any>>;
  }
}
