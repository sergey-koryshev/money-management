import { Component } from '@angular/core';
import { ModalSubmitEvent } from '@app/components/modal-dialog/modal-dialog.model';
import { Expense } from '@app/models/expense.model';
import { ExpenseForm } from '../expense-form/expense-form.model';
import { ExpensesHttpClientService } from '@app/http-clients/expenses-http-client.service';
import { ChangeExpenseParams } from '@app/http-clients/expenses-http-client.model';

@Component({
  selector: 'app-edit-expense-dialog',
  templateUrl: './edit-expense-dialog.component.html',
  styleUrls: ['./edit-expense-dialog.component.scss']
})
export class EditExpenseDialogComponent {
  item?: Expense;
  error?: string;

  constructor(private expensesHttpClient: ExpensesHttpClientService) { }

  onSubmit(event: ModalSubmitEvent<ExpenseForm>) {
    if (!event.value) {
      return;
    }

    this.error = undefined;
    const { id, date, priceAmount, permittedPersons, ...restParams } = event.value;

    const params: ChangeExpenseParams = {
      date: new Date(date.year, date.month - 1, date.day),
      priceAmount: Number(priceAmount),
      permittedPersonsIds: permittedPersons?.map((u) => Number(u.id)),
      ...restParams
    }

    this.expensesHttpClient.editExpense(id, params).subscribe({
      next: (updatedItem: Expense) => {
        event.modalRef.close(updatedItem);
      },
      error: (err) => this.error = err.error.message ?? err.message
    });
  }
}
