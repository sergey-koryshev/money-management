import { SortEvent, TableColumn, TableColumnType } from './table.model';
import { Component, Input, QueryList, ViewChildren, OnInit } from '@angular/core';
import { emptyTableData } from '@app/constants';
import { ObjectKey } from '@app/models/base.model';
import { SortableHeaderDirective } from './sortable-header.directive';

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

  @Input()
  defaultSorting: SortEvent;

  sortedData: T[];

  columnTypes = TableColumnType;

  emptyTableData = emptyTableData;

  @ViewChildren(SortableHeaderDirective)
  headers: QueryList<SortableHeaderDirective>;

  ngOnInit(): void {
    this.sortedData = this.data;
    this.setDefaultSorting();
  }

  setDefaultSorting() {
    if (!this.defaultSorting) {
      return;
    }
    this.onSort(this.defaultSorting, true);
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

  onSort({column, direction}: SortEvent, skipHeaders: boolean = false) {
    if (!skipHeaders) {
      this.headers.forEach((header: SortableHeaderDirective) => {
        if (header.sortable !== column) {
          header.direction = '';
        }
      });
    }
    if (direction === '' || column === '') {
      this.sortedData = this.data;
    } else {
      this.sortedData = [...this.data].sort((a, b) => {
        const res = this.compareProperties(this.extractProperty(a, column), this.extractProperty(b, column));
        return direction === 'asc' ? res : -res;
      });
    }
  }

  compareProperties(a: any, b: any) {
    if ((typeof a === 'string') || (typeof a === 'number') && 
      (typeof b === 'string' || typeof b === 'number')) {
      return a < b ? -1 : a > b ? 1 : 0;
    }

    return 0;
  }
}

