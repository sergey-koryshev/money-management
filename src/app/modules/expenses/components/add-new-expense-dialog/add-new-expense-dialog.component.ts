import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Component } from '@angular/core';

@Component({
  selector: 'app-add-new-expense-dialog',
  templateUrl: './add-new-expense-dialog.component.html',
  styleUrls: ['./add-new-expense-dialog.component.scss']
})
export class AddNewExpenseDialogComponent {
  modalRef: NgbActiveModal;

  constructor(activeModal: NgbActiveModal) {
    this.modalRef = activeModal;
  }
}
