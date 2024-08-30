import { Injectable } from '@angular/core';
import { BaseHttpClientService } from './base-http-client.service';
import { UserConnection } from '@app/models/user-connection.model';

@Injectable({
  providedIn: 'root'
})
export class UserConnectionHttpClient {
  constructor(private baseHttpClient: BaseHttpClientService) {}

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
