import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserConnection } from '@app/models/user-connnection.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddNewConnectionDialogComponent } from '../../components/add-new-connection-dialog/add-new-connection-dialog.component';

@Component({
  selector: 'app-user-connections-page',
  templateUrl: './user-connections-page.component.html',
  styleUrls: ['./user-connections-page.component.scss']
})
export class UserConnectionsPageComponent {
  connections: UserConnection[];

  constructor(private route: ActivatedRoute, private modalService: NgbModal) {
    this.route.data.subscribe((data) => {
      this.connections = data.connections as UserConnection[];
      this.sortConnections();
    });
  }

  sortConnections() {
    this.connections = this.connections.sort((first, second) => {
      const firstLine = first.user.firstName ? first.user.firstName + first.user.secondName : first.user.id?.toString();
      const secondLine = second.user.firstName ? second.user.firstName + second.user.secondName : second.user.id?.toString();

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
