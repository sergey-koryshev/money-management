import { Component, Input, OnInit } from '@angular/core';
import { Announcement } from '@app/models/announcement.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'notices-dialog',
  templateUrl: './notice-dialog.component.html',
  styleUrls: ['./notice-dialog.component.scss']
})
export class NoticesDialogComponent {
  @Input()
  public announcement: Announcement

  public modalRef: NgbActiveModal;

  constructor(activeModal: NgbActiveModal) {
    this.modalRef = activeModal;
  }
}
