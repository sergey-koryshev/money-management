import { Injectable } from '@angular/core';
import { UserConnectionHttpClient } from '@app/http-clients/user-connections-http-client.service';
import { User } from '@app/models/user.model';
import { BehaviorSubject, of, pipe, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  storageName = "user-profile";
  user$: BehaviorSubject<User | null>
  pendingConnectionsCount$: BehaviorSubject<number>

  get isLoggedIn() {
    return this.user$.value !== null;
  }

  constructor(private userConnectionsHttpClient: UserConnectionHttpClient) {
    this.user$ = new BehaviorSubject<User | null>(null);
    this.pendingConnectionsCount$ = new BehaviorSubject<number>(0);
    this.user$.subscribe((user) => {
      if (!user) {
        this.pendingConnectionsCount$.next(0);
        return;
      }

      this.fetchPendingConnectionsCount();
    });
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

  public fetchPendingConnectionsCount() {
    this.userConnectionsHttpClient
      .getPendingConnectionsCount()
      .subscribe((value) => this.pendingConnectionsCount$.next(value));
  }
}
