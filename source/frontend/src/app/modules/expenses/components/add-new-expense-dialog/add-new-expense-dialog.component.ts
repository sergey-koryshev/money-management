import { Component, EventEmitter } from '@angular/core';
import { ModalSubmitEvent } from '@app/components/modal-dialog/modal-dialog.model';
import { ChangeExpenseParams } from '@app/http-clients/expenses-http-client.model';
import { Expense } from '@app/models/expense.model';

@Component({
  selector: 'app-add-new-expense-dialog',
  templateUrl: './add-new-expense-dialog.component.html',
  styleUrls: ['./add-new-expense-dialog.component.scss']
})
export class AddNewExpenseDialogComponent {
  item?: Expense;
  error?: string;

  submitted = new EventEmitter<ChangeExpenseParams>();

  onSubmit(event: ModalSubmitEvent<ChangeExpenseParams | null>) {
    if (!event.value) {
      return;
    }

    const params: Omit<ChangeExpenseParams, 'Id'> = event.value;
    this.error = undefined;
    this.submitted.emit(params);
  }
}
