import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserConnectionHttpClient } from '@app/http-clients/user-connections-http-client.service';
import { UserConnectionStatus } from '@app/models/enums/user-connection-status.enum';
import { UserConnection } from '@app/models/user-connection.model';
import { UserService } from '@app/services/user.service';

@Component({
  selector: 'app-user-connections-list',
  templateUrl: './user-connections-list.component.html',
  styleUrls: ['./user-connections-list.component.scss']
})
export class UserConnectionsListComponent {
  @Input()
  connections: UserConnection[]

  @Output()
  statusChanged = new EventEmitter();

  userConnectionStatus = UserConnectionStatus;

  constructor(private userConnectionsHttpClient: UserConnectionHttpClient, private userService: UserService) {}

  onAcceptButtonClick(connection: UserConnection) {
    this.userConnectionsHttpClient
      .acceptUserConnection(connection.id).subscribe({
        next: (updatedConnection) => {
          const existingConnectionIndex = this.connections.findIndex((c) => c.id === connection.id);
          this.connections[existingConnectionIndex] = updatedConnection;
          this.userService.connections$.next(this.connections);
          this.statusChanged.emit();
        }
      });
  }

  onDeleteButtonClick(connection: UserConnection) {
    this.userConnectionsHttpClient
      .deleteUserConnection(connection.id).subscribe({
        next: () => {
          const existingConnectionIndex = this.connections.findIndex((c) => c.id === connection.id);
          this.connections.splice(existingConnectionIndex, 1);
          this.userService.connections$.next(this.connections);
        }
      });
  }
}
