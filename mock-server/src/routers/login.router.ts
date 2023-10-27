import { LoginController } from '../controllers/login.controller';
import { RouterBase } from './router-base';

export class LoginRouter extends RouterBase<LoginController> {
  initialize(): void {
    this.router.post('/', this.controller.login);
  }
}

