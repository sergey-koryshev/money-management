export interface User {
  id: number
  tenant: string
  firstName: string
  secondName?: string
}

export interface PolyUser {
  id?: number
  tenant?: string
  firstName?: string
  secondName?: string
}
