import { Identifier } from '../../models/identifier.model'

export interface MainCurrencyEntity extends Identifier {
  currencyId: number
  tenant: string
}
