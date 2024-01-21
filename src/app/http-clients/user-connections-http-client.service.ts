import { CreateUserConnectionParams } from './../../../mock-server/src/models/create-user-connection-params.model';
import { Injectable } from '@angular/core';
import { BaseHttpClientService } from './base-http-client.service';
import { UserConnection } from '@app/models/user-connnection.model';

@Injectable({
  providedIn: 'root'
})
export class UserConnectionHttpClient {
  constructor(private baseHttpClient: BaseHttpClientService) { }

  getPendingConnectionsCount() {
    return this.baseHttpClient.get<number>('userConnections/pendingConnectionsCount');
  }

  getUserConnections() {
    return this.baseHttpClient.get<UserConnection[]>('userConnections');
  }

  acceptUserConnections(connectionId: number) {
    return this.baseHttpClient.post<UserConnection>(`userConnections/${connectionId}/accept`);
  }

  declineUserConnections(connectionId: number) {
    return this.baseHttpClient.post<void>(`userConnections/${connectionId}/decline`);
  }

  deleteUserConnections(connectionId: number) {
    return this.baseHttpClient.delete<void>(`userConnections/${connectionId}`);
  }

  createUserConnection(params: CreateUserConnectionParams) {
    return this.baseHttpClient.post<UserConnection>(`userConnections`, params)
  }
}
