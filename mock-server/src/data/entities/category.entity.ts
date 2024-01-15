import { Identifier } from '../../models/identifier.model'

export interface CategoryEntity extends Identifier
{
  name: string
  tenant: string
}
