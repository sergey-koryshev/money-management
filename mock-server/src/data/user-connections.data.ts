import { UserConnection } from '../models/user-connection.model';
import { UserConnectionEntity } from './entities/user-connection.entity';
import { UserConnectionStatus } from '../models/user-connection-status.enum';
import { UserShort } from '../models/user.model';
import { users } from './users.data';

export function userConnectionEntityToModel(entity: UserConnectionEntity, tenant: string): UserConnection {
  const targetUser = users.find((u) => u.id === entity.connectedUserId);

  if (!targetUser) {
    throw new Error(`User with ID ${entity.userId} doesn't exist`);
  }

  let status: UserConnectionStatus;

  if (userConnections.filter((c) => c.userId === entity.connectedUserId || c.connectedUserId === entity.userId).length == 2) {
    status = UserConnectionStatus.accepted;
  } else (
    status = targetUser.tenant === tenant
      ? UserConnectionStatus.pendingOnTargetUser
      : UserConnectionStatus.pending
  )

  const userShortModel: UserShort = {}

  if (status === UserConnectionStatus.accepted || status === UserConnectionStatus.pending) {
    userShortModel.firstName = targetUser.firstName;
    userShortModel.secondName = targetUser.secondName;
    userShortModel.tenant = targetUser.tenant;
  }

  if (status === UserConnectionStatus.accepted || status === UserConnectionStatus.pendingOnTargetUser) {
    userShortModel.id = targetUser.id;
  }

  return {
    user: userShortModel,
    status: status
  }
}

export const userConnections: UserConnectionEntity[] = [
  {
    userId: 2,
    connectedUserId: 1
  }
];
