import * as jwt from 'jsonwebtoken'
import { Request, Response } from 'express';
import { compareSync, hashSync } from 'bcryptjs';
import { ControllerBase } from './controller-base';

export class LoginController extends ControllerBase {
  public login = (req: Request, res: Response) => {
    const user = this.dataContext.usersDbSet.find(u => u.email === req.body.email);
    // exposes password to create new users,
    // TODO: need to remove once registration process is implemented
    if (user){
      console.log(hashSync(req.body.password, 10))
    }

    if (!user || !compareSync(req.body.password, user.password)) {
      return this.sendError(res, 400, 'Invalid credentials');
    }

    const token = jwt.sign(
      { tenant: user.tenant },
      process.env.AUTH_TOKEN_SECRET as string,
      { expiresIn: '1d' }
    );

    this.sendData(res.cookie('access_token', token, {
      httpOnly: true
    }),{
      id: user.id,
      tenant: user.tenant,
      firstName: user.firstName,
      secondName: user.secondName
    });
  }

  public logout = (_: Request, res: Response) => {
    res.clearCookie('access_token');
    res.sendStatus(204);
  }
}

