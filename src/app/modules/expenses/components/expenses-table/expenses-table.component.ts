import { SortEvent, TableColumn } from '@components/table/table.model';
import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { Expense } from '@app/models/expense.model';

@Component({
  selector: 'app-expenses-table',
  templateUrl: './expenses-table.component.html',
  styleUrls: ['./expenses-table.component.scss']
})
export class ExpansesTableComponent {

  @Input()
  data: Expense[];

  columns: TableColumn<Expense>[] = [
    {
      name: 'date',
      displayName: 'Date',
      function: (row: Expense) => new Date(row.date).toLocaleDateString()
    },
    {
      name: 'item',
      displayName: 'Item(s)'
    },
    {
      name: 'price',
      displayName: 'Price',
      template: () => this.price
    }
  ];

  defaultSorting: SortEvent = {
    column: 'date',
    direction: 'asc'
  }

  @ViewChild('price', { read: TemplateRef, static: true })
  price: TemplateRef<unknown>;
}
