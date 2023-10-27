import * as jwt from 'jsonwebtoken'
import { NextFunction, Request, Response } from 'express';

export function auth(req: Request, res: Response, next: NextFunction) {
  const accessToken = req?.cookies['access_token'];

  if (accessToken == null) {
    return res.sendStatus(401);
  }

  jwt.verify(accessToken, process.env.AUTH_TOKEN_SECRET as string, (err: unknown) => {
    if (err) {
      console.log(err);
      return res.sendStatus(401);
    }
    next();
  });
}
