import { ExpensesHttpClientService } from '@http-clients/expenses-http-client.service';
import { SortEvent, TableColumn } from '@components/table/table.model';
import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { Expense } from '@app/models/expense.model';
import { priceComparer } from '@app/helpers/comparers.helper';

@Component({
  selector: 'app-expenses-table',
  templateUrl: './expenses-table.component.html',
  styleUrls: ['./expenses-table.component.scss']
})
export class ExpensesTableComponent {

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

  constructor(private expensesHttpClient: ExpensesHttpClientService) {}

  removeItem(item: Expense) {
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
}
