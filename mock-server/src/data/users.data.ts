import { User } from '../models/user.model';
import { UserEntity } from './entities/user.entity';

export function userEntityToModel(entity: UserEntity): User {
  return entity;
}

export const users: UserEntity[] = [
  {
    id: 1,
    tenant: '22a11263-56da-4327-98b7-f99d6591ac3c',
    email: 'user1@test.com',
    firstName: 'User 1',
    password: '$2b$10$7RmSyFQRVeT/6Z93E6ZOqOds8REBHn7YRW/fRSzetEbvuQyNlfwUy' // test
  },
  {
    id: 2,
    tenant: 'f1d4515b-f201-4696-86b8-3580ad740ada',
    email: 'user2@test.com',
    firstName: 'User 2',
    password: '$2b$10$7RmSyFQRVeT/6Z93E6ZOqOds8REBHn7YRW/fRSzetEbvuQyNlfwUy' // test
  },
  {
    id: 3,
    tenant: 'f1d4515b-f201-4696-86b8-3080ad740ada',
    email: 'user3@test.com',
    firstName: 'User 3',
    password: '$2b$10$7RmSyFQRVeT/6Z93E6ZOqOds8REBHn7YRW/fRSzetEbvuQyNlfwUy' // test
  }
]
