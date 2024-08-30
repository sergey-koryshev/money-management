import { Injectable } from '@angular/core';
import { BaseHttpClientService } from './base-http-client.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryHttpClient {

  constructor(private baseHttpClient: BaseHttpClientService) {}

  getUniqueCategoryNames() {
    return this.baseHttpClient.get<string[]>('categories/uniqueNames');
  }
}
