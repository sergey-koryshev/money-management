import { Component } from '@angular/core';
import { UserConnection } from '@app/models/user-connection.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddNewConnectionDialogComponent } from '../../components/add-new-connection-dialog/add-new-connection-dialog.component';
import { UserService } from '@app/services/user.service';

@Component({
  selector: 'app-user-connections-page',
  templateUrl: './user-connections-page.component.html',
  styleUrls: ['./user-connections-page.component.scss']
})
export class UserConnectionsPageComponent {
  connections: UserConnection[];

  constructor(userService: UserService, private modalService: NgbModal) {
    userService.connections$.subscribe((connections) => {
      this.connections = connections;
      this.sortConnections();
    });
  }

  sortConnections() {
    this.connections = this.connections.sort((first, second) => {
      const firstLine = first.person.firstName ? first.person.firstName + first.person.secondName : first.person.id?.toString();
      const secondLine = second.person.firstName ? second.person.firstName + second.person.secondName : second.person.id?.toString();

      return (first.status - second.status)
        || (firstLine && secondLine
          ? firstLine.localeCompare(secondLine)
          : 0)
    })
  }

  openAddNewConnectionDialog() {
    this.modalService.open(AddNewConnectionDialogComponent).closed
      .subscribe((userConnection) => {
        this.connections.push(userConnection);
        this.sortConnections();
      });
  }
}
