import { Identifier } from '../../models/identifier.model'

export interface UserConnectionEntity extends Identifier {
  requestorUserId: number
  targetUserId: number
  accepted: boolean
  requestDate: Date
  acceptDate?: Date
}
