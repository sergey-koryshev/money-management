import { Injectable } from '@angular/core';
import { BaseHttpClientService } from './base-http-client.service';
import { Announcement } from '@app/models/announcement.model';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementsHttpClient {
  constructor(private baseHttpClient: BaseHttpClientService) {}

  get() {
    return this.baseHttpClient.get<Announcement[]>('announcements');
  }

  dismiss(id: number) {
    return this.baseHttpClient.post<void>(`announcements/${id}/dismiss`)
  }
}
