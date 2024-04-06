import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UserConnectionHttpClient } from '@app/http-clients/user-connections-http-client.service';
import { UserConnectionStatus } from '@app/models/enums/user-connection-status.enum';
import { UserConnection } from '@app/models/user-connection.model';
import { AuthService } from '@app/services/auth.service';

@Component({
  selector: 'app-user-connections-list',
  templateUrl: './user-connections-list.component.html',
  styleUrls: ['./user-connections-list.component.scss']
})
export class UserConnectionsListComponent implements OnInit {
  @Input()
  connections: UserConnection[]

  @Output()
  statusChanged = new EventEmitter();

  userConnectionStatus = UserConnectionStatus;

  constructor(private userConnectionsHttpClient: UserConnectionHttpClient, private authService: AuthService) { }

  ngOnInit(): void {
  }

  onAcceptButtonClick(connection: UserConnection) {
    if (!connection.id) {
      return;
    }

    this.userConnectionsHttpClient
      .acceptUserConnections(connection.id).subscribe({
        next: (updatedConnection) => {
          const existingConnectionIndex = this.connections.findIndex((c) => c.id === connection.id);
          this.connections[existingConnectionIndex] = updatedConnection;
          this.authService.fetchPendingConnectionsCount();
          this.statusChanged.emit();
        }
      });
  }

  onDeclineButtonClick(connection: UserConnection) {
    if (!connection.id) {
      return;
    }

    this.userConnectionsHttpClient
      .declineUserConnections(connection.id).subscribe({
        next: () => {
          const existingConnectionIndex = this.connections.findIndex((c) => c.id === connection.id);
          this.connections.splice(existingConnectionIndex, 1);
          this.authService.fetchPendingConnectionsCount();
        }
      });
  }

  onDeleteButtonClick(connection: UserConnection) {
    if (!connection.id) {
      return;
    }

    this.userConnectionsHttpClient
      .deleteUserConnections(connection.id).subscribe({
        next: () => {
          const existingConnectionIndex = this.connections.findIndex((c) => c.id === connection.id);
          this.connections.splice(existingConnectionIndex, 1);
        }
      });
  }
}
