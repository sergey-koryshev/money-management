import { RouterBase } from './router-base';
import { UserConnectionsController } from '../controllers/user-connections.controller';
import { auth } from '../middleware/auth.middleware';

export class UserConnectionRouter extends RouterBase<UserConnectionsController> {
  initialize(): void {
    this.router.use(auth);
    this.router.get('/pendingConnectionsCount', this.controller.getPendingConnectionsCount);
    this.router.get('', this.controller.getUserConnections);
    this.router.post('/:id/accept', this.controller.acceptRequest);
    this.router.post('/:id/decline', this.controller.declineRequest);
    this.router.delete('/:id', this.controller.deleteUserConnection);
    this.router.post('', this.controller.createConnection);
  }
}

