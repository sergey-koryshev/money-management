import { Category } from '../models/category.model';
import { CategoryEntity } from './entities/category.entity';

export function categoryEntityToModel(entity: CategoryEntity): Category {
  return {
    id: entity.id,
    name: entity.name
  };
}

export const categories: CategoryEntity[] = [
  {
    id: 0,
    name: 'Restaurants (User 1)',
    tenant: '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    id: 1,
    name: 'Groceries (User 1)',
    tenant: '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    id: 2,
    name: 'Web Shops (User 1)',
    tenant: '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    id: 3,
    name: 'Markets (User 2)',
    tenant: 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    id: 4,
    name: 'Delivery Food (User 2)',
    tenant: 'f1d4515b-f201-4696-86b8-3580ad740ada'
  }
]
