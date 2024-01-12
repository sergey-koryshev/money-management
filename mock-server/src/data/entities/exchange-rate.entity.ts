import { Identifier } from '../../models/identified.model'

export interface ExchangeRateEntity extends Identifier {
  fromCurrencyId: number
  toCurrencyId: number
  rate: number
}
