import { CategoriesController } from '../controllers/categories.controller';
import { RouterBase } from './router-base';
import { auth } from '../middleware/auth.middleware';

export class CategoriesRouter extends RouterBase<CategoriesController> {
  initialize(): void {
    this.router.use(auth);
    this.router.get('/', auth, this.controller.getCategories);
  }
}

