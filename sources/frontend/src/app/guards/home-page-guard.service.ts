import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';

@Injectable()
export class HomePageGuardService implements CanActivate {

  constructor(private authService: AuthService, public router: Router) { }

  canActivate() {
    if (this.authService.isLoggedIn) {
      this.router.navigate(['expenses']);
    }
    return !this.authService.isLoggedIn;
  }

}
