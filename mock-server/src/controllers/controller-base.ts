import { DataContext } from '../data/data-context';
import { Response } from 'express';

export abstract class ControllerBase {
  constructor(protected dataContext: DataContext) {}

  protected sendError(res: Response, statusCode: number, errorMassage: string) {
    res.statusCode = statusCode;
    return res.send({
      code: statusCode,
      message: errorMassage
    })
  }

  protected sendData<T>(res: Response, data: T) {
    res.statusCode = data ? 200 : 204;
    return res.send({
      code: 200,
      data
    })
  }
}
