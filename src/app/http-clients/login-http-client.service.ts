import { Injectable } from '@angular/core';
import { BaseHttpClientService } from './base-http-client.service';
import { User } from '@app/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class LoginHttpClient {

  constructor(private baseHttpClient: BaseHttpClientService) { }

  login(email: string, password: string) {
    return this.baseHttpClient.post<User>('signin', {
      email,
      password
    });
  }
}
