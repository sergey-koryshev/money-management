import { Request, Response } from 'express';
import { ControllerBase } from './controller-base';

export class CategoriesController extends ControllerBase {
  public getCategories = (req: Request, res: Response) => {
    this.sendData(res, this.dataContext.getCategories(req.userTenant));
  }
}
