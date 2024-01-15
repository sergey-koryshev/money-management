import { Identifier } from '../../models/identifier.model'

export interface UserEntity extends Identifier {
  tenant: string
  email: string
  firstName: string
  secondName?: string
  password: string
}
