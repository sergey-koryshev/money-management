import * as jwt from 'jsonwebtoken'
import { Request, Response } from 'express';
import { compareSync, hashSync } from 'bcrypt';
import { ControllerBase } from './controller-base';

export class LoginController extends ControllerBase {
  public login = (req: Request, res: Response) => {
    const user = this.dataContext.users.find(u => u.email === req.body.email);
    // need to remove it once registration is implemented
    // if (user){
    //   console.log(hashSync(req.body.password, 10))
    // }

    if (!user || !compareSync(req.body.password, user.password)) {
      return res.status(400).send(this.wrapData('Invalid credentials'));
    }

    const token = jwt.sign(
      { tenant: user.tenant },
      process.env.AUTH_TOKEN_SECRET as string,
      { expiresIn: '1d' }
    );

    res.cookie('access_token', token, {
      httpOnly: true
    }).send(this.wrapData({
      tenant: user.tenant,
      firstName: user.firstName,
      secondName: user.secondName
    }));
  }
}

