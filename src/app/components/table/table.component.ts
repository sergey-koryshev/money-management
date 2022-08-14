import { TableColumn, TableColumnType } from './table.model';
import { Component, Input, OnInit } from '@angular/core';
import { emptyTableData } from '@app/constants';
import { ObjectKey } from '@app/models/base.model';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent<T> implements OnInit {

  @Input()
  columns: TableColumn<T>[];

  @Input()
  data: T[];

  columnTypes = TableColumnType;
  emptyTableData = emptyTableData;

  constructor() { }

  ngOnInit(): void {
  }

  getColumnType(column: TableColumn<T>): TableColumnType {
    if (column['function']) {
      return TableColumnType.function;
    }

    if (column['template']) {
      return TableColumnType.template;
    }

    return TableColumnType.text;
  }

  extractProperty(object: any, propertyName: string) {
    const propertyKey = propertyName as ObjectKey;
    return object[propertyKey];
  }
}
