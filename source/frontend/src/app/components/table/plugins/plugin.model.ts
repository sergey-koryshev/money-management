import { InjectionToken } from "@angular/core";
import { SortDescriptor, TableColumn } from "../table.model";
import { TableComponent } from "../table.component";

export const TABLE_PLUGIN_TOKEN = new InjectionToken<TablePlugin<any>[]>('TablePlugin');

export interface TablePlugin<T> {
  name: string
  init: (table: TableComponent<T>) => void
  onColumnsReordered: (columns: TableColumn<T>[]) => void
  onTableInitialized: () => void
  onVisibleColumnsChanged: (columns: TableColumn<T>[]) => void
  onSortingChanged: (descriptor: SortDescriptor | undefined) => void
}
