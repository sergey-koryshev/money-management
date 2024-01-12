import { Identifier } from '../../models/identified.model'

export interface MainCurrencyEntity extends Identifier {
  currencyId: number
  tenant: string
}
