import { Identifier } from '../../models/identified.model'

export interface CurrencyEntity extends Identifier {
  name: string
  friendlyName: string
  flagCode: string
  sign?: string
}
