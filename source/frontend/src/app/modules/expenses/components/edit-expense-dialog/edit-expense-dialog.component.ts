import { Component, EventEmitter } from '@angular/core';
import { ModalSubmitEvent } from '@app/components/modal-dialog/modal-dialog.model';
import { Expense } from '@app/models/expense.model';
import { ChangeExpenseParams } from '@app/http-clients/expenses-http-client.model';

@Component({
  selector: 'app-edit-expense-dialog',
  templateUrl: './edit-expense-dialog.component.html',
  styleUrls: ['./edit-expense-dialog.component.scss']
})
export class EditExpenseDialogComponent {
  item?: Expense;
  error?: string;

  submitted = new EventEmitter<ChangeExpenseParams>();

  onSubmit(event: ModalSubmitEvent<ChangeExpenseParams | null>) {
    if (!event.value || !event.value.id) {
      return;
    }

    const params: Omit<ChangeExpenseParams, 'Id'> = event.value;
    this.error = undefined;
    this.submitted.emit(params);
  }
}
