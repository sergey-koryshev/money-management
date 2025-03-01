import { Component } from '@angular/core';
import { ModalSubmitEvent } from '@app/components/modal-dialog/modal-dialog.model';
import { ExpensesHttpClientService } from '@app/http-clients/expenses-http-client.service';
import { ChangeExpenseParams } from '@app/http-clients/expenses-http-client.model';

@Component({
  selector: 'app-add-new-expense-dialog',
  templateUrl: './add-new-expense-dialog.component.html',
  styleUrls: ['./add-new-expense-dialog.component.scss']
})
export class AddNewExpenseDialogComponent {
  error?: string;

  constructor(private expensesHttpClient: ExpensesHttpClientService) { }

  onSubmit(event: ModalSubmitEvent<ChangeExpenseParams | null>) {
    if (!event.value) {
      return;
    }

    const params: Omit<ChangeExpenseParams, 'Id'> = event.value;
    this.error = undefined;
    this.expensesHttpClient.addNewExpense(params)
      .subscribe({
        next: (addedExpanse) => event.modalRef.close(addedExpanse),
        error: (err) => this.error = err.error.message ?? err.message
      });
  }
}
