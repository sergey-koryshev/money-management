import { Injectable } from '@angular/core';
import { BaseHttpClientService } from './base-http-client.service';
import { UserConnection } from '@app/models/user-connection.model';
import { CreateUserConnectionParams } from './user-connections-http-client.model';

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
