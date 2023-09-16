import { Injectable } from '@angular/core';
import { BaseHttpClientService } from './base-http-client.service';
import { Category } from '@app/models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryHttpClient {

  constructor(private baseHttpClient: BaseHttpClientService) { }

  getAllCategories() {
    return this.baseHttpClient.get<Category[]>('categories');
  }
}
