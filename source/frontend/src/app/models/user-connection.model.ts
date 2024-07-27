import { AmbiguousUser } from "./user.model"
import { UserConnectionStatus } from "./enums/user-connection-status.enum"

export interface UserConnection {
  id: number
  person: AmbiguousUser
  status: UserConnectionStatus
}
