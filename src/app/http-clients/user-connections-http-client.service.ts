import { Injectable } from '@angular/core';
import { BaseHttpClientService } from './base-http-client.service';

@Injectable({
  providedIn: 'root'
})
export class UserConnectionHttpClient {

  constructor(private baseHttpClient: BaseHttpClientService) { }

  getPendingConnectionsCount() {
    return this.baseHttpClient.get<number>('userConnections/getPendingConnectionsCount')
  }
}
