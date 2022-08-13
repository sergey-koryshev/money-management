import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Currency } from '@models/currency.model';

@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.scss']
})
export class CurrencyComponent implements OnChanges {
  @Input()
  currency: Currency;
  countryFlagClass: string;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.currency) {
      this.countryFlagClass = `fi-${this.currency.flagCode}`;
    }
  }
}
