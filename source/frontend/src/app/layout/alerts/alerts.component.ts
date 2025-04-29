import { Component, EventEmitter } from "@angular/core";
import { AnnouncementsHttpClient } from "@app/http-clients/announcements-http-client.service";
import { Announcement } from "@app/models/announcement.model";
import { AnnouncementType } from "@app/models/enums/announcement-type.enum";
import { UserService } from "@app/services/user.service";
import { skipWhile, switchMap } from "rxjs";

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss']
})
export class AlertsComponent {
  alert?: Announcement
  dismissed = new EventEmitter<void>()

  constructor(userService: UserService, announcementsHttpClient: AnnouncementsHttpClient) {
    userService.announcements$.subscribe((announcements) => {
      this.alert = announcements?.find((a) => a.type === AnnouncementType.Alert)
    });

    this.dismissed.pipe(
      skipWhile(() => this.alert == null),
      switchMap(() => announcementsHttpClient.dismiss(this.alert!.id)))
    .subscribe({
      next: this.alert = undefined
    });
  }
}
