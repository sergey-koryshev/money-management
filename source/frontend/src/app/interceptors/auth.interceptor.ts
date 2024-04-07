import { AuthService } from '@app/services/auth.service';
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

  constructor(private router: Router, private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    request = request.clone({
      withCredentials: true,
    });

    return next.handle(request).pipe(tap(
      () => {},
      (err) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            this.authService.removeUser();
            this.router.navigate(['signin']);
          }
        }
      }));
  }
}
