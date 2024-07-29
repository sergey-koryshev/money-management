export interface User {
  id: number
  tenant: string
  firstName: string
  secondName?: string
}

export interface AmbiguousUser {
  id: number
  tenant?: string
  firstName?: string
  secondName?: string
}
