import { PolyUser } from '../models/user.model';
import { UserConnection } from '../models/user-connection.model';
import { UserConnectionEntity } from './entities/user-connection.entity';
import { UserConnectionStatus } from '../models/user-connection-status.enum';
import { users } from './users.data';

export function userConnectionEntityToModel(entity: UserConnectionEntity, tenant: string): UserConnection {
  const requestor = users.find((u) => u.id === entity.requestorUserId);

  if (!requestor) {
    throw new Error(`User with ID ${entity.requestorUserId} doesn't exist`);
  }

  const targetUser = users.find((u) => u.id === entity.targetUserId);

  if (!targetUser) {
    throw new Error(`User with ID ${entity.targetUserId} doesn't exist`);
  }

  const currentUser = users.find((u) => u.tenant === tenant);

  if (!currentUser) {
    throw new Error(`User with tenant ${tenant} doesn't exist`);
  }

  if (currentUser.id != requestor.id && currentUser.id != targetUser.id) {
    throw new Error(`Current user with tenant ${tenant} is not related to the user connection`);
  }

  const status = entity.acceptDate
    ? UserConnectionStatus.accepted
    : requestor.id === currentUser.id
      ? UserConnectionStatus.pendingOnTargetUser
      : UserConnectionStatus.pending;

  const userShortModel: PolyUser = {}

  const user = requestor.id === currentUser.id ? targetUser : requestor

  if (status === UserConnectionStatus.accepted || status === UserConnectionStatus.pending) {
    userShortModel.firstName = user.firstName;
    userShortModel.secondName = user.secondName;
    userShortModel.tenant = user.tenant;
  }

  if (status === UserConnectionStatus.accepted || status === UserConnectionStatus.pendingOnTargetUser) {
    userShortModel.id = user.id;
  }

  return {
    id: entity.id,
    user: userShortModel,
    status: status
  }
}

export const userConnections: UserConnectionEntity[] = [
  {
    id: 1,
    requestorUserId: 2,
    targetUserId: 1,
    requestDate: new Date('2024-01-01 00:01:08'),
    accepted: true,
    acceptDate: new Date('2024-01-10 00:18:42')
  },
  {
    id: 2,
    requestorUserId: 2,
    targetUserId: 3,
    requestDate: new Date('2024-01-01 05:01:08'),
    accepted: false
  },
  {
    id: 3,
    requestorUserId: 1,
    targetUserId: 3,
    requestDate: new Date('2024-01-01 12:01:08'),
    accepted: false
  }
];
