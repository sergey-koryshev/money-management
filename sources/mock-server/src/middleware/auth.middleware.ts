import * as jwt from 'jsonwebtoken'
import { NextFunction, Request, Response } from 'express';
import { JwtToken } from '../models/jwt-token.model';

export function auth(req: Request, res: Response, next: NextFunction) {
  const accessToken = req?.cookies['access_token'];

  if (accessToken == null) {
    return res.sendStatus(401);
  }

  jwt.verify(accessToken, process.env.AUTH_TOKEN_SECRET as string, (err: jwt.VerifyErrors | null, decoded?: jwt.JwtPayload | string) => {
    if (err) {
      console.log(err);
      res.clearCookie('access_token');
      return res.sendStatus(401);
    }

    const { tenant } = decoded as JwtToken
    req.userTenant = tenant;

    next();
  });
}
