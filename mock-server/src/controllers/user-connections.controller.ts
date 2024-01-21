import { Request, Response } from 'express';
import { ControllerBase } from './controller-base';
import { CreateUserConnectionParams } from '../models/create-user-connection-params.model';
import { userConnectionEntityToModel } from '../data/user-connections.data';

export class UserConnectionsController extends ControllerBase {
  public getUserConnections = (req: Request, res: Response) => {
    const user = this.dataContext.usersDbSet.find((u) => u.tenant === req.userTenant);

    if (!user) {
      return this.sendError(res, 500, `User with tenant ${req.userTenant} doesn't exist`);
    }

    const connections = this.dataContext.userConnectionsDbSet
      .filter((c) => c.requestorUserId === user.id || c.targetUserId === user.id)
      .map((c) => userConnectionEntityToModel(c, user.tenant));

    return this.sendData(res, connections);
  }

  public createConnection = (req: Request<unknown, unknown, CreateUserConnectionParams>, res: Response) => {
    const user = this.dataContext.usersDbSet.find((u) => u.tenant === req.userTenant);

    if (!user?.id) {
      return this.sendError(res, 500, `User with tenant ${req.userTenant} doesn't exist`);
    }

    if (user.id === req.body.userId) {
      return this.sendError(res, 500, 'You cannot create connection with yourself');
    }

    const targetUser = this.dataContext.usersDbSet.find((u) => u.id === req.body.userId);

    if (!targetUser?.id) {
      return this.sendError(res, 500, `User with id ${req.body.userId} doesn't exist`);
    }

    const existingConnection = this.dataContext.userConnectionsDbSet.find((c) => (c.requestorUserId === user.id && c.targetUserId === req.body.userId) || (c.requestorUserId === req.body.userId && c.targetUserId === user.id));

    if (existingConnection) {
      return this.sendError(res, 500, `Connection with user ${req.body.userId} already exists`);
    }

    const addedConnection = this.dataContext.addEntity({
      requestorUserId: user.id,
      targetUserId: targetUser.id,
      requestDate: new Date(),
      accepted: false
    }, this.dataContext.userConnectionsDbSet);

    this.sendData(res, userConnectionEntityToModel(addedConnection, req.userTenant));
  }

  public getPendingConnectionsCount = (req: Request, res: Response) => {
    const user = this.dataContext.usersDbSet.find((u) => u.tenant === req.userTenant);

    if (!user?.id) {
      return this.sendError(res, 500, `User with tenant ${req.userTenant} doesn't exist`)
    }

    const pendingConnections = this.dataContext.userConnectionsDbSet
      .filter((c) => c.targetUserId === user.id && !c.accepted);

    this.sendData(res, pendingConnections.length);
  }

  public acceptRequest = (req: Request, res: Response) => {
    const user = this.dataContext.usersDbSet.find((u) => u.tenant === req.userTenant);

    if (!user?.id) {
      return this.sendError(res, 500, `User with tenant ${req.userTenant} doesn't exist`)
    }

    const userConnectionIndex = this.dataContext.userConnectionsDbSet.findIndex((c) => c.id === Number(req.params['id']));

    if (userConnectionIndex < 0) {
      return this.sendError(res, 500, `Connection with id ${req.body.userConnectionId} doesn't exist`);
    }

    const userConnection = this.dataContext.userConnectionsDbSet[userConnectionIndex];

    if (userConnection.targetUserId !== user.id) {
      return this.sendError(res, 500, 'You doesn\'t have permissions to approve the connection');
    }

    const approvedUserConnection = {...userConnection, acceptDate: new Date(), accepted: true}

    this.dataContext.userConnectionsDbSet[userConnectionIndex] = approvedUserConnection;

    this.sendData(res, userConnectionEntityToModel(approvedUserConnection, req.userTenant));
  }

  public declineRequest = (req: Request, res: Response) => {
    const user = this.dataContext.usersDbSet.find((u) => u.tenant === req.userTenant);

    if (!user?.id) {
      return this.sendError(res, 500, `User with tenant ${req.userTenant} doesn't exist`)
    }

    const userConnectionIndex = this.dataContext.userConnectionsDbSet.findIndex((c) => c.id === Number(req.params['id']));

    if (userConnectionIndex < 0) {
      return this.sendError(res, 500, `Connection with id ${req.body.userConnectionId} doesn't exist`);
    }

    const userConnection = this.dataContext.userConnectionsDbSet[userConnectionIndex];

    if (userConnection.targetUserId !== user.id) {
      return this.sendError(res, 500, 'You doesn\'t have permissions to decline the connection');
    }

    this.dataContext.userConnectionsDbSet.splice(userConnectionIndex, 1);

    this.sendData(res, null);
  }

  public deleteUserConnection = (req: Request, res: Response) => {
    const user = this.dataContext.usersDbSet.find((u) => u.tenant === req.userTenant);

    if (!user?.id) {
      return this.sendError(res, 500, `User with tenant ${req.userTenant} doesn't exist`)
    }

    const userConnectionIndex = this.dataContext.userConnectionsDbSet.findIndex((c) => c.id === Number(req.params['id']));

    if (userConnectionIndex < 0) {
      return this.sendError(res, 500, `Connection with id ${req.body.userConnectionId} doesn't exist`);
    }

    const userConnection = this.dataContext.userConnectionsDbSet[userConnectionIndex];

    if (userConnection.requestorUserId !== user.id && userConnection.targetUserId !== user.id) {
      return this.sendError(res, 500, 'You doesn\'t have permissions to delete the connection');
    }

    this.dataContext.userConnectionsDbSet.splice(userConnectionIndex, 1);

    this.sendData(res, null);
  }
}
