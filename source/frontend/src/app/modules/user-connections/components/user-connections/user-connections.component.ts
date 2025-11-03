import { Component, OnDestroy } from '@angular/core';
import { UserConnection } from '@app/models/user-connection.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '@app/services/user.service';
import { Subject, take, takeUntil } from 'rxjs';

@Component({
  selector: 'app-user-connections',
  templateUrl: './user-connections.component.html',
  styleUrls: ['./user-connections.component.scss']
})
export class UserConnectionsComponent implements OnDestroy {
  connections: UserConnection[];

  destroy$ = new Subject<void>();

  constructor(private userService: UserService, private modalService: NgbModal) {
    this.userService.connections$.pipe(takeUntil(this.destroy$)).subscribe((connections) => {
      this.connections = connections;
      this.sortConnections();
    });

    this.fetchConnections();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchConnections() {
    this.userService.updateConnections().pipe(take(1)).subscribe();
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

  onConnectionAdded(userConnection: UserConnection) {
    this.connections.push(userConnection);
    this.sortConnections();
  }
}
