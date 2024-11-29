import { Price } from "@app/models/price.model";

export interface ItemChangedEventArgs {
  oldPrice?: Price,
  newPrice?: Price
}
