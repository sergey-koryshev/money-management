import { Injectable } from '@angular/core';
import { User } from '@app/models/user.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  storageName = "user-profile";
  user$: BehaviorSubject<User | null>

  get isLoggedIn() {
    return this.user$.value !== null;
  }

  constructor() {
    this.user$ = new BehaviorSubject<User | null>(null);
  }

  initialize() {
    this.user$.next(this.getUser());
  }

  public removeUser() {
    window.localStorage.removeItem(this.storageName);
    this.user$.next(null);
  }

  public getUser(): User | null {
    const user = window.localStorage.getItem(this.storageName);

    if (!user) {
      return null;
    }

    return JSON.parse(user);
  }

  public saveUser(user: User) {
    this.removeUser();
    window.localStorage.setItem(this.storageName, JSON.stringify(user))
    this.user$.next(user);
  }
}
