import { Identifier } from '../../models/identifier.model'

export interface CurrencyEntity extends Identifier {
  name: string
  friendlyName: string
  flagCode: string
  sign?: string
}
