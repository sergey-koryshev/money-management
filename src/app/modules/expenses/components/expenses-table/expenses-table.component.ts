import { TableColumn } from '@app/components/table/table.model';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Expense } from '@app/models/expense.model';

@Component({
  selector: 'app-expenses-table',
  templateUrl: './expenses-table.component.html',
  styleUrls: ['./expenses-table.component.scss']
})
export class ExpansesTableComponent implements OnInit {

  columns: TableColumn<Expense>[] = [
    {
      name: 'date',
      displayName: 'Date',
      function: (row: Expense) => row.date.toLocaleDateString()
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
  ]

  data: Expense[] = [
    {
      id: 0,
      date: new Date('08/01/2022'),
      item: 'Something',
      price: {
        amount: 134,
        currency: {
          id: 1,
          name: "RSD",
          friendlyName: "Serbian dinar",
          flagCode: "rs"
        }
      }
    },
    {
      id: 0,
      date: new Date('08/01/2022'),
      item: 'Another shit I did not want to buy',
      price: {
        amount: 1056,
        currency: {
          id: 0,
          name: "RUB",
          friendlyName: "Russian ruble",
          flagCode: "ru"
        }
      }
    }
  ]

  @ViewChild('price', { read: TemplateRef, static: true })
  price: TemplateRef<unknown>;
  
  constructor() { }

  ngOnInit(): void {
  }

}
