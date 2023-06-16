import { DataContext } from '../data/data-context';

export abstract class ControllerBase {
  constructor(protected dataContext: DataContext) {}

  protected wrapData(data: unknown) {
    return {
      data
    }
  }
}
