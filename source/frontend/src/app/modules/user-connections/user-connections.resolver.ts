import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { UserService } from "@app/services/user.service";

@Injectable()
export class UserConnectionsResolver implements Resolve<void> {
  constructor(private userService: UserService) {}

  resolve() {
    this.userService.updateConnections();
  }
}
