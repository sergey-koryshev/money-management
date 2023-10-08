import { ExpensesHttpClientService } from '@http-clients/expenses-http-client.service';
import { SortEvent, TableColumn } from '@components/table/table.model';
import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { Expense } from '@app/models/expense.model';
import { priceComparer } from '@app/helpers/comparers.helper';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EditExpenseDialogComponent } from '../edit-expense-dialog/edit-expense-dialog.component';
import { Month } from '@app/models/month.model';

@Component({
  selector: 'app-expenses-table',
  templateUrl: './expenses-table.component.html',
  styleUrls: ['./expenses-table.component.scss']
})
export class ExpensesTableComponent {

  @Input()
  selectedMonth?: Month;

  @Input()
  data: Expense[];

  columns: TableColumn<Expense>[] = [
    {
      name: 'date',
      displayName: 'Date',
      function: (row) => new Date(row.date).toLocaleDateString()
    },
    {
      name: 'category',
      displayName: 'Category',
      function: (row) => row.category ? row.category.name : '-',
      sortFunc: (f, s) => {
        return (f.category
          ? f.category.name
          : '').localeCompare(s.category
            ? s.category.name
            : '');
      }
    },
    {
      name: 'item',
      displayName: 'Item',
      stretch: true
    },
    {
      name: 'price',
      displayName: 'Price',
      template: () => this.price,
      sortFunc: priceComparer
    },
    {
      name: 'actions',
      ignorePadding: true,
      disableSorting: true,
      template: () => this.actions
    }
  ];

  defaultSorting: SortEvent = {
    column: 'date',
    direction: 'asc'
  }

  @ViewChild('price', { read: TemplateRef, static: true })
  price: TemplateRef<unknown>;

  @ViewChild('actions', { read: TemplateRef, static: true })
  actions: TemplateRef<unknown>;

  @ViewChild('confirmationDialog', { read: TemplateRef, static: true })
  confirmationDialog: TemplateRef<unknown>;

  constructor(private expensesHttpClient: ExpensesHttpClientService, private modalService: NgbModal) {}

  removeItem(item: Expense) {
    this.modalService.open(this.confirmationDialog).closed.subscribe((res: boolean) => {
      if (res) {
        const indexOfItem = this.data.indexOf(item);

        if (item.id != null) {
          this.expensesHttpClient.removeExpense(item.id).subscribe({
            complete: () => {
              this.data.splice(indexOfItem, 1);
            },
            error: (ex) => {
              console.log(`Error has occurred while deleting item: ${ex.message}`)
            }});
        } else {
          this.data.splice(indexOfItem, 1);
        }
      }
    });
  }

  editItem(item: Expense) {
    const modalRef = this.modalService.open(EditExpenseDialogComponent);
    modalRef.componentInstance.item = {...item, date: new Date(item.date)};
    modalRef.closed.subscribe(({date, priceAmount, ...restParams}) => {
      const indexOfItem = this.data.indexOf(item);
      this.expensesHttpClient.editExpense({
        date: new Date(date.year, date.month - 1, date.day),
        priceAmount: Number(priceAmount),
        ...restParams
      }).subscribe({
        next: (updatedItem: Expense) => {
          if (this.selectedMonth == null
            || (this.selectedMonth.month == date.month
              && this.selectedMonth.year == date.year)) {
            this.data[indexOfItem] = updatedItem;
          } else {
            this.data.splice(indexOfItem, 1);
          }
        },
        error: (ex) => {
          console.log(`Error has occurred while updating item: ${ex.message}`)
        }});
    });
  }
}
