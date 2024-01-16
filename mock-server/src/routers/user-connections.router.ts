import { RouterBase } from './router-base';
import { UserConnectionsController } from '../controllers/user-connections.controller';
import { auth } from '../middleware/auth.middleware';

export class UserConnectionRouter extends RouterBase<UserConnectionsController> {
  initialize(): void {
    this.router.use(auth);
    this.router.get('/getPendingConnectionsCount', this.controller.getPendingConnectionsCount);
  }
}

