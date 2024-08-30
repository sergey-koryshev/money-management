import { Component } from '@angular/core';
import { ModalSubmitEvent } from '@app/components/modal-dialog/modal-dialog.model';
import { ExpensesHttpClientService } from '@app/http-clients/expenses-http-client.service';
import { ChangeExpenseParams } from '@app/http-clients/expenses-http-client.model';
import { ExpenseForm } from '../expense-form/expense-form.model';

@Component({
  selector: 'app-add-new-expense-dialog',
  templateUrl: './add-new-expense-dialog.component.html',
  styleUrls: ['./add-new-expense-dialog.component.scss']
})
export class AddNewExpenseDialogComponent {
  error?: string;

  constructor(private expensesHttpClient: ExpensesHttpClientService) { }

  onSubmit(event: ModalSubmitEvent<ExpenseForm>) {
    if (!event.value) {
      return;
    }

    this.error = undefined;
    const { date, priceAmount, permittedPersons, ...restParams } = event.value;

    const params: ChangeExpenseParams = {
      date: new Date(date.year, date.month - 1, date.day),
      priceAmount: Number(priceAmount),
      permittedPersonsIds: permittedPersons?.map((u) => Number(u.id)),
      ...restParams
    }

    this.expensesHttpClient.addNewExpense(params)
      .subscribe({
        next: (addedExpanse) => event.modalRef.close(addedExpanse),
        error: (err) => this.error = err.error.message ?? err.message
      });
  }
}
