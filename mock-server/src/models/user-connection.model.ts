import { UserConnectionStatus } from './user-connection-status.enum'
import { UserShort } from './user.model'

export interface UserConnection {
  user: UserShort
  status: UserConnectionStatus
}
