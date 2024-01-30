import { PolyUser } from "@app/models/user.model";

export function getUserFullName(user: PolyUser): string {
  return user.firstName ? `${user.firstName}${user.secondName ? ' ' + user.secondName : ''}` : `User ID: #${user.id}`;
}

export function getUserInitials(user: PolyUser): string {
  return user.firstName ? user.firstName[0] + (user.secondName ? user.secondName[0] : '') : 'U';
}
