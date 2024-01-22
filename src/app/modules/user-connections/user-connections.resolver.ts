import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { UserConnectionHttpClient } from "@app/http-clients/user-connections-http-client.service";
import { UserConnection } from "@app/models/user-connnection.model";
import { Observable } from "rxjs";

@Injectable()
export class UserConnectionsResolver implements Resolve<UserConnection[]> {
  constructor(private userConnectionsHttpClient: UserConnectionHttpClient) {}
  resolve(): Observable<UserConnection[]>  {
    return this.userConnectionsHttpClient.getUserConnections();
  }
}
