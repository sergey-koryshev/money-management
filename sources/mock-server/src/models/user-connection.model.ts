import { PolyUser } from './user.model'
import { UserConnectionStatus } from './user-connection-status.enum'

export interface UserConnection {
  id?: number
  user: PolyUser
  status: UserConnectionStatus
}
