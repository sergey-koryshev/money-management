import { DataContext } from '../data/data-context';

export abstract class ControllerBase {
  constructor(protected dataContext: DataContext) {}

  protected wrapData<T>(data: T) {
    return {
      data
    }
  }
}
