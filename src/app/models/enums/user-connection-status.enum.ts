export enum UserConnectionStatus {
  pending,
  pendingOnTargetUser,
  accepted
}

export const userConnectionStatusIdToLabel = {
  [UserConnectionStatus.pending]: 'Pending',
  [UserConnectionStatus.pendingOnTargetUser]: 'Not accepted yet',
  [UserConnectionStatus.accepted]: 'Accepted'
}
