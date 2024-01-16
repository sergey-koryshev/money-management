export interface User {
  id: number
  tenant: string
  firstName: string
  secondName?: string
}

export interface UserShort {
  id?: number
  tenant?: string
  firstName?: string
  secondName?: string
}
