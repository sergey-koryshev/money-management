import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UserConnectionStatus } from '@app/models/enums/user-connection-status.enum';
import { UserConnection } from '@app/models/user-connnection.model';

const userConnectionStatusToColor = {
  [UserConnectionStatus.pending]: '#E7DA69',
  [UserConnectionStatus.pendingOnTargetUser]: '#E7DA69',
  [UserConnectionStatus.accepted]: '#87D599'
}

@Component({
  selector: 'app-user-connection-card',
  templateUrl: './user-connection-card.component.html',
  styleUrls: ['./user-connection-card.component.scss']
})
export class UserConnectionCardComponent implements OnInit {
  @Input()
  connection: UserConnection;

  @Output()
  connectionAccepted = new EventEmitter<UserConnection>();

  @Output()
  connectionDeclined = new EventEmitter<UserConnection>();

  @Output()
  connectionCancelled = new EventEmitter<UserConnection>();

  @Output()
  connectionRemoved = new EventEmitter<UserConnection>();

  initials: string;
  userConnectionStatus = UserConnectionStatus;
  statusPinColor: string;

  constructor() { }

  ngOnInit(): void {
    this.initials = this.connection.user.firstName ? this.connection.user.firstName[0] + (this.connection.user.secondName ? this.connection.user.secondName[0] : '') : 'U';
    this.statusPinColor = userConnectionStatusToColor[this.connection.status];
  }

  onAcceptButtonClick() {
    this.connectionAccepted.emit(this.connection);
  }

  onDeclineButtonClick() {
    this.connectionDeclined.emit(this.connection);
  }

  onCancelButtonClick() {
    this.connectionCancelled.emit(this.connection);
  }

  onRemoveButtonClick() {
    this.connectionRemoved.emit(this.connection);
  }
}
