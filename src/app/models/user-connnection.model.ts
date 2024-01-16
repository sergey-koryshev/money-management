import { UserConnectionStatus } from "./enums/user-connection-status.enum"
import { UserShort } from "./user.model"

export interface UserConnection {
  id: number
  user: UserShort
  status: UserConnectionStatus
}
