import { Price } from "@app/models/price.model";

export interface ItemChange {
  oldPrice?: Price,
  newPrice?: Price
}
