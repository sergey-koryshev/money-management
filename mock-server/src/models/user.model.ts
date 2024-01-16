export interface User {
  id?: number;
  tenant: string;
  email: string;
  firstName: string;
  secondName?: string;
  password: string;
}

export interface UserShort {
  id?: number
  tenant?: string,
  firstName?: string,
  secondName?: string
}
