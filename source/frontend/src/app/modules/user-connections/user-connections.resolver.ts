import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { UserService } from "@app/services/user.service";
import { Observable } from "rxjs";

@Injectable()
export class UserConnectionsResolver implements Resolve<void> {
  constructor(private userService: UserService) {}

  resolve(): Observable<void>  {
    return this.userService.updateConnections();
  }
}
