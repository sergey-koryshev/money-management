import { CategoriesController } from '../controllers/categories.controller';
import { RouterBase } from './router-base';

export class CategoriesRouter extends RouterBase<CategoriesController> {
  initialize(): void {
    this.router.get('/', this.controller.getCategories);
  }
}

