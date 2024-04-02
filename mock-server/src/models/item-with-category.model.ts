import { Category } from './category.model';

export interface ItemWithCategory {
  item: string;
  category?: Category;
}
