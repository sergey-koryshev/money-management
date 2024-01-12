import { Identifier } from '../../models/identifier.model'

export interface ExchangeRateEntity extends Identifier {
  fromCurrencyId: number
  toCurrencyId: number
  rate: number
}
