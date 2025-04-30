import { Injectable } from '@angular/core';
import { AnnouncementsHttpClient } from '@app/http-clients/announcements-http-client.service';
import { UserConnectionHttpClient } from '@app/http-clients/user-connections-http-client.service';
import { Announcement } from '@app/models/announcement.model';
import { UserConnection } from '@app/models/user-connection.model';
import { User } from '@models/user.model';
import { BehaviorSubject, forkJoin, map, of, skipWhile, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  storageName = "user-profile";
  user$ = new BehaviorSubject<User | null>(null);
  connections$ = new BehaviorSubject<UserConnection[]>([]);
  announcements$ = new BehaviorSubject<Announcement[] | null>(null)

  get isLoggedIn() {
    return this.user$.value !== null;
  }

  get user() {
    return this.user$.value;
  }

  constructor(private userConnectionsHttpClient: UserConnectionHttpClient, private announcementsHttpClient: AnnouncementsHttpClient) {
    this.user$
      .pipe(
        skipWhile((user) => user == null),
        switchMap(this.loadUserDetails.bind(this)))
      .subscribe();
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
      return of()
    }

    return this.userConnectionsHttpClient.getUserConnections().pipe(map((connections) => this.connections$.next(connections)));
  }

  public fetchNotices() {
    if (this.user == null) {
      this.announcements$.next([]);
      return of()
    }

    return this.announcementsHttpClient.get().pipe(map((announcements) => this.announcements$.next(announcements)));
  }

  private loadUserDetails() {
    const updateConnections$ = this.updateConnections();
    const updateNotice$ = this.fetchNotices();
    return forkJoin([updateConnections$, updateNotice$]);
  }
}
