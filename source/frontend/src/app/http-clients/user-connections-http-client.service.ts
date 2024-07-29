import { Injectable } from '@angular/core';
import { BaseHttpClientService } from './base-http-client.service';
import { UserConnection } from '@app/models/user-connection.model';

@Injectable({
  providedIn: 'root'
})
export class UserConnectionHttpClient {
  constructor(private baseHttpClient: BaseHttpClientService) {
    baseHttpClient.migratedEndpoints.push(
      {
        type: 'GET',
        path: 'connections'
      },
      {
        type: 'GET',
        path: 'connections/pendingConnectionRequestsAmount'
      },
      {
        type: 'POST',
        path: 'connections'
      },
      {
        type: 'POST',
        path: /connections\/\d+\/accept/
      },
      {
        type: 'DELETE',
        path: /connections\/\d+/
      }
    );
  }

  getPendingConnectionsCount() {
    return this.baseHttpClient.get<number>('connections/pendingConnectionRequestsAmount');
  }

  getUserConnections() {
    return this.baseHttpClient.get<UserConnection[]>('connections');
  }

  acceptUserConnection(connectionId: number) {
    return this.baseHttpClient.post<UserConnection>(`connections/${connectionId}/accept`);
  }

  deleteUserConnection(connectionId: number) {
    return this.baseHttpClient.delete<void>(`connections/${connectionId}`);
  }

  createUserConnection(userId: number) {
    return this.baseHttpClient.post<UserConnection>(`connections`, userId)
  }
}
