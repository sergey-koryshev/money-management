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
    id: 1,
    name: 'Online Shop',
    tenant: '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    id: 2,
    name: 'Bakery',
    tenant: 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    id: 3,
    name: 'Medicine',
    tenant: 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    id: 4,
    name: 'Grocery',
    tenant: '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    id: 5,
    name: 'Delivery Food',
    tenant: 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    id: 6,
    name: 'Market',
    tenant: 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    id: 7,
    name: 'Other',
    tenant: '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    id: 8,
    name: 'Restaurant',
    tenant: '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    id: 9,
    name: 'Coffee Shop',
    tenant: 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    id: 10,
    name: 'Wine Shop',
    tenant: 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    id: 11,
    name: 'Health & Beauty',
    tenant: 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    id: 12,
    name: 'Clothing Shop',
    tenant: '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    id: 13,
    name: 'Mobile & Internet',
    tenant: '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    id: 14,
    name: 'Сonfectionery',
    tenant: 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    id: 15,
    name: 'Rent',
    tenant: 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    id: 16,
    name: 'Travel',
    tenant: 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    id: 17,
    name: 'Fast Food',
    tenant: '22a11263-56da-4327-98b7-f99d6591ac3c'
  },
  {
    id: 18,
    name: 'Electronics Shop',
    tenant: 'f1d4515b-f201-4696-86b8-3580ad740ada'
  },
  {
    id: 19,
    name: 'Tea Shop',
    tenant: '22a11263-56da-4327-98b7-f99d6591ac3c'
  }
]
