export interface User {
  id?: number;
  tenant: string;
  email: string;
  firstName: string;
  secondName?: string;
  password: string;
}
