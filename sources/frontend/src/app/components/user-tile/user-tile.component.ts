import { User } from '@models/user.model';
import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-user-tile',
  templateUrl: './user-tile.component.html',
  styleUrls: ['./user-tile.component.scss']
})
export class UserTileComponent implements OnChanges {
  @Input()
  user: User;

  @Input()
  short: boolean;

  initials: string;

  ngOnChanges(): void {
    this.initials = this.user.firstName[0] + (this.user.secondName ? this.user.secondName[0] : '')
  }
}
