export interface User {
  id?: number;
  tenant: string;
  email: string;
  firstName: string;
  secondName?: string;
  password: string;
}

export interface PolyUser {
  id?: number
  tenant?: string,
  firstName?: string,
  secondName?: string
}
