import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from '@app/services/user.service';

@Injectable()
export class HomePageGuardService implements CanActivate {

  constructor(private userService: UserService, public router: Router) { }

  canActivate() {
    if (this.userService.isLoggedIn) {
      this.router.navigate(['expenses']);
    }
    return !this.userService.isLoggedIn;
  }

}
