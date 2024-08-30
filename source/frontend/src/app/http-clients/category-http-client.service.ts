import { Injectable } from '@angular/core';
import { BaseHttpClientService } from './base-http-client.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryHttpClient {

  constructor(private baseHttpClient: BaseHttpClientService) {
    baseHttpClient.migratedEndpoints.push({
      type: 'GET',
      path: 'categories/uniqueNames'
    });
  }

  getUniqueCategoryNames() {
    return this.baseHttpClient.get<string[]>('categories/uniqueNames');
  }
}
