import { Component, EventEmitter } from "@angular/core";

@Component({
  selector: 'app-delete-expense-dialog',
  templateUrl: './delete-expense-dialog.component.html'
})
export class DeleteExpenseDialogComponent {
  error?: string;

  submitted = new EventEmitter<boolean>();

  onSubmit() {
    this.error = undefined;
    this.submitted.emit(true);
  }
}
