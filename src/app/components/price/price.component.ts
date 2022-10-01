import { ExchangedPrice } from '@models/exchanged-price.model';
import { Component, Input, OnInit } from '@angular/core';
import { Price } from '@app/models/price.model';
import { isInstanceOfExchangedPrice } from '@app/helpers/interfaces.helper';

@Component({
  selector: 'app-price',
  templateUrl: './price.component.html',
  styleUrls: ['./price.component.scss']
})
export class PriceComponent implements OnInit {
  @Input()
  price: Price;
  
  exchangedPrice: ExchangedPrice;

  ngOnInit(): void {
    if(isInstanceOfExchangedPrice(this.price)) {
      this.exchangedPrice = this.price;
    }
  }
}

