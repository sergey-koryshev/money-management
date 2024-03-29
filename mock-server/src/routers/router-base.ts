import { DataContext } from '../data/data-context';
import { Router } from 'express';

export abstract class RouterBase<T> {
  protected controller: T;
  public router: Router;

  constructor(type: (new (dataContext: DataContext) => T), dataContext: DataContext) {
    this.controller = new type(dataContext);
    this.router = Router();
    this.initialize();
  }

  abstract initialize() : void
}
