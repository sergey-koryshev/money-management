import { Component } from '@angular/core';
import { Expense } from '@app/models/expense.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-edit-expense-dialog',
  templateUrl: './edit-expense-dialog.component.html',
  styleUrls: ['./edit-expense-dialog.component.scss']
})
export class EditExpenseDialogComponent  {
  modalRef: NgbActiveModal;
  item?: Expense;

  constructor(activeModal: NgbActiveModal) {
    this.modalRef = activeModal;
  }
}
