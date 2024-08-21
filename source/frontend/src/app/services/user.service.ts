import { Injectable } from '@angular/core';
import { CategoryHttpClient } from '@app/http-clients/category-http-client.service';
import { UserConnectionHttpClient } from '@app/http-clients/user-connections-http-client.service';
import { UserConnection } from '@app/models/user-connection.model';
import { User } from '@app/models/user.model';
import { BehaviorSubject, filter, iif, map, mergeMap, of, switchMap, tap, zip } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  storageName = "user-profile";
  user$ = new BehaviorSubject<User | null>(null);
  connections$ = new BehaviorSubject<UserConnection[]>([]);
  categories$ = new BehaviorSubject<string[]>([]);

  get isLoggedIn() {
    return this.user$.value !== null;
  }

  get user() {
    return this.user$.value;
  }

  constructor(private userConnectionsHttpClient: UserConnectionHttpClient, categoryHttpClient: CategoryHttpClient) {
    this.user$
      .pipe(switchMap((user) => zip(
        user != null ? this.userConnectionsHttpClient.getUserConnections() : of([]),
        user != null ? categoryHttpClient.getUniqueCategoryNames() : of([]))))
      .subscribe(([connections, categories]) => {
          this.connections$.next(connections);
          this.categories$.next(categories);
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

  public updateConnections() {
    if (this.user == null) {
      this.connections$.next([]);
    }

    return this.userConnectionsHttpClient.getUserConnections().pipe(map((connections) => this.connections$.next(connections)));
  }
}
