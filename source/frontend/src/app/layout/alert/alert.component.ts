import { Component, OnDestroy } from "@angular/core";
import { AnnouncementsHttpClient } from "@app/http-clients/announcements-http-client.service";
import { Announcement } from "@app/models/announcement.model";
import { AnnouncementType } from "@app/models/enums/announcement-type.enum";
import { UserService } from "@app/services/user.service";
import { EMPTY, Subject, takeUntil } from "rxjs";

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnDestroy {
  alert?: Announcement;

  private destroy$ = new Subject<void>();

  constructor(private userService: UserService, private announcementsHttpClient: AnnouncementsHttpClient) {
    this.userService.announcements$.pipe(takeUntil(this.destroy$)).subscribe((announcements) => {
      this.alert = announcements?.find((a) => a.type === AnnouncementType.Alert)
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  dismiss() {
    (this.alert?.id ? this.announcementsHttpClient.dismiss(this.alert.id) : EMPTY)
      .pipe(takeUntil(this.destroy$)).subscribe().add(this.alert = undefined)
  }
}
