import { Request, Response } from 'express';
import { ControllerBase } from './controller-base';

export class UserConnectionsController extends ControllerBase {
  public getPendingConnectionsCount = (req: Request, res: Response) => {
    const user = this.dataContext.usersDbSet.find((u) => u.tenant === req.userTenant);

    if (!user?.id) {
      throw new Error(`User with tenant ${req.userTenant} doesn't exist`)
    }

    const a = this.dataContext.userConnections
      .filter((c) => c.userId === user.id)
      .map((c) => c.connectedUserId);

    const pendingConnections = this.dataContext.userConnections
      .filter((c) => c.connectedUserId === user.id && !a.includes(c.userId));

    res.send(this.wrapData(pendingConnections.length))
  }
}

