import { UserService } from '@app/services/user.service';
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router, private userService: UserService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    request = request.clone({
      withCredentials: true,
    });

    return next.handle(request).pipe(tap(
      () => {},
      (err) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            this.userService.removeUser();
            this.router.navigate(['signin']);
          }
        }
      }));
  }
}
