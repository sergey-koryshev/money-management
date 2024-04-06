import { Component } from '@angular/core';
import { ModalSubmitEvent } from '@app/components/modal-dialog/modal-dialog.model';
import { UserConnectionHttpClient } from '@app/http-clients/user-connections-http-client.service';

@Component({
  selector: 'app-add-new-connection-dialog',
  templateUrl: './add-new-connection-dialog.component.html',
  styleUrls: ['./add-new-connection-dialog.component.scss']
})
export class AddNewConnectionDialogComponent {
  userId: number;
  error?: string;

  constructor(private userConnectionsHttpClient: UserConnectionHttpClient) { }

  onSubmit(event: ModalSubmitEvent) {
    if (!this.userId) {
      return;
    }

    this.error = undefined;

    this.userConnectionsHttpClient
      .createUserConnection({userId: Number(this.userId)}).subscribe({
        next: (createdConnection) => {
          event.modalRef.close(createdConnection);
        },
        error: (err) => this.error = err.error.message ?? err.message
      });
  }

}
