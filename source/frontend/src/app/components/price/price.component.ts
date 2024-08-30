import { Component, Input } from '@angular/core';
import { Price } from '@app/models/price.model';

@Component({
  selector: 'app-price',
  templateUrl: './price.component.html',
  styleUrls: ['./price.component.scss']
})
export class PriceComponent {
  @Input()
  price: Price;

  @Input()
  originalPrice: Price;
}

