import { Component, EventEmitter, Output } from '@angular/core';
import { UserConnectionHttpClient } from '@app/http-clients/user-connections-http-client.service';
import { UserConnection } from '@app/models/user-connection.model';
import { UserService } from '@app/services/user.service';

@Component({
  selector: 'app-add-new-connection-form',
  templateUrl: './add-new-connection-form.component.html'
})
export class AddNewConnectionFormComponent {
  userId?: number;
  error?: string;
  processing = false;

  @Output()
  connectionAdded = new EventEmitter<UserConnection>();

  constructor(private userConnectionsHttpClient: UserConnectionHttpClient, private userService: UserService) { }

  onAddConnectionButtonClick() {
    if (!this.userId) {
      return;
    }

    if (!Number(this.userId)) {
      this.error = 'User ID must be a number.';
      return;
    }

    if (this.userService.connections$.value.find((c) => c.person.id === Number(this.userId))) {
      this.error = 'Connection with this user already exists.';
      return;
    }

    this.error = undefined;
    this.processing = true;

    this.userConnectionsHttpClient
      .createUserConnection(Number(this.userId)).subscribe({
        next: (createdConnection) => {
          this.connectionAdded.emit(createdConnection);
          this.userId = undefined;
        },
        error: (err) => this.error = err.error.message ?? err.message
      }).add(() => {
        this.processing = false;
      });
  }
}
