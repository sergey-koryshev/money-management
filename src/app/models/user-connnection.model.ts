import { UserConnectionStatus } from "./enums/user-connection-status.enum"

export interface UserConnection {
  id: number
  status: UserConnectionStatus
}
