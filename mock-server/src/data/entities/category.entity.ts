import { Identifier } from '../../models/identified.model'

export interface CategoryEntity extends Identifier
{
  name: string
  tenant: string
}
