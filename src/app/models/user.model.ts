import { UserConnection } from "./user-connnection.model"

export interface User {
  id: number
  tenant: string,
  firstName: string,
  secondName?: string
  connections: UserConnection[]
}
