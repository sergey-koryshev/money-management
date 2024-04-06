import { User } from '../models/user.model';
import { UserEntity } from './entities/user.entity';

export function userEntityToModel(entity: UserEntity): User {
  if (entity.id == null) {
    throw new Error('User doesn\'t contains id');
  }

  return {
    id: entity.id,
    tenant: entity.tenant,
    firstName: entity.firstName,
    secondName: entity.secondName
  };
}

export const users: UserEntity[] = [
  {
    id: 1,
    tenant: '22a11263-56da-4327-98b7-f99d6591ac3c',
    email: 'sergey@test.com',
    firstName: 'Sergey',
    secondName: 'Koryshev',
    password: '$2b$10$7RmSyFQRVeT/6Z93E6ZOqOds8REBHn7YRW/fRSzetEbvuQyNlfwUy' // test
  },
  {
    id: 2,
    tenant: 'f1d4515b-f201-4696-86b8-3580ad740ada',
    email: 'sofia@test.com',
    firstName: 'Sofia',
    secondName: 'Nifontova',
    password: '$2b$10$7RmSyFQRVeT/6Z93E6ZOqOds8REBHn7YRW/fRSzetEbvuQyNlfwUy' // test
  }
]
