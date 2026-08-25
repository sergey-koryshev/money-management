import { SortDescriptor, TableColumn, TableColumnType, TableConfig } from './table.model';
import { Component, Input, QueryList, ViewChildren, OnDestroy, inject } from '@angular/core';
import { emptyTableData } from '@app/constants';
import { ObjectKey } from '@app/models/base.model';
import { SortableHeaderDirective } from './sortable-header.directive';
import { ContextMenuOpenEvent } from '@perfectmemory/ngx-contextmenu';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TABLE_PLUGIN_TOKEN, TablePlugin } from './plugins/plugin.model';
import { PluginsHandler } from './plugins/plugins-handler';

const DEFAULT_CONFIG: TableConfig<any> = {
  columns: []
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent<T> implements OnDestroy {
  private _currentSorting?: SortDescriptor;
  private plugins = inject<TablePlugin<T>[]>(TABLE_PLUGIN_TOKEN, { optional: true }) ?? [];
  private _config?: TableConfig<T>;
  private _data: T[] = [];
  private _initialized = false;

  @Input()
  set config(config: Partial<TableConfig<T>>) {
    this._config = {
      ...DEFAULT_CONFIG,
      ...config
    };
    this.init(this._config);
  }
  get config(): Partial<TableConfig<T>> {
    return this._config ?? DEFAULT_CONFIG;
  }

  @Input()
  set data(data: T[]) {
    this._data = data;
    this.sortedData = data;
    this.calculateVisibleColumns();
    this.sort(this.currentSorting)
  }

  @Input()
  loading = false;

  sortedData: T[] = [];
  columnTypes = TableColumnType;
  emptyTableData = emptyTableData;
  activeRowForFloatingMenuItem?: T;
  visibleColumns: TableColumn<T>[] = [];
  allColumns: TableColumn<T>[] = [];
  pluginsHandler: PluginsHandler<T>

  get currentSorting(): SortDescriptor | undefined {
    return this._currentSorting;
  }

  @ViewChildren(SortableHeaderDirective) headers: QueryList<SortableHeaderDirective>;

  constructor() {
    this.pluginsHandler = new PluginsHandler(this.plugins, this);
    this.pluginsHandler.init();
  }

  ngOnDestroy(): void {
    this.pluginsHandler?.destroy();
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

  onSortingChanged($event: SortDescriptor | undefined) {
    this.initializeSorting($event);
  }

  initializeSorting($event: SortDescriptor | undefined, skipEvent = false) {
    if (JSON.stringify($event) === JSON.stringify(this._currentSorting)) {
      return;
    }

    this._currentSorting = $event;

    if (this._initialized && !skipEvent) {
      this.pluginsHandler.sortingChanged$.next($event);
    }

    if (this.headers) {
      // remove sorting direction in another columns
      const column = $event?.column;
      this.headers.forEach((header: SortableHeaderDirective) => {
        if (header.sortable !== column) {
          header.direction = '';
        }
      });
    }

    this.sort($event);
  }

  compareProperties(a: any, b: any) {
    if ((typeof a === 'string') || (typeof a === 'number') &&
      (typeof b === 'string' || typeof b === 'number')) {
      return a < b ? -1 : a > b ? 1 : 0;
    }

    return 0;
  }

  onFloatingMenuClose() {
    this.activeRowForFloatingMenuItem = undefined;
  }

  onFloatingMenuOpen($event: ContextMenuOpenEvent<any>) {
    this.activeRowForFloatingMenuItem = $event.value;
  }

  onColumnDrop($event: CdkDragDrop<TableColumn<T>, TableColumn<T>, TableColumn<T>>) {
    moveItemInArray(this.visibleColumns, $event.previousIndex, $event.currentIndex);
    this.pluginsHandler.columnsReordered$.next(this.visibleColumns);
  }

  reorderColumns(order: string[] | undefined, skipEvent = false) {
    if (!order || order.length == 0) {
      return;
    }

    const rank = (name: string) => {
      const index = order.indexOf(name);
      return index === -1 ? order.length : index;
    };

    this.allColumns.sort((a, b) => rank(a.name) - rank(b.name));

    const before = JSON.stringify(this.visibleColumns.map((c) => c.name));
    this.visibleColumns.sort((a, b) => rank(a.name) - rank(b.name));
    const after = JSON.stringify(this.visibleColumns.map((c) => c.name));

    if (this._initialized && !skipEvent && before !== after) {
      this.pluginsHandler.columnsReordered$.next(this.visibleColumns);
    }
  }

  private sort(event: SortDescriptor | undefined) {
    if (!event || !this._data) {
      return;
    }

    const {column, direction} = event;

    if (direction === '' || column === '') {
      this.sortedData = this._data;
    } else {
      const columnDefinition = this.getColumnDefinition(column);
      const compareFunc = columnDefinition?.sortFunc ;
      this.sortedData = [...this._data].sort((a, b) => {
        const result = compareFunc
          ? compareFunc(a, b)
          : this.compareProperties(this.extractProperty(a, column), this.extractProperty(b, column));
        return direction === 'asc' ? result : -result;
      });
    }
  }

  private getColumnDefinition(columnName: string) {
    return this.allColumns?.find((column) => column.name === columnName);
  }

  private calculateVisibleColumns() {
    if (!this.allColumns || this.allColumns.length == 0) {
      return;
    }

    const before = JSON.stringify(this.visibleColumns.map((c) => c.name));
    this.visibleColumns = this.allColumns.filter((c) => c.hide ? c.hide() : true);
    const after = JSON.stringify(this.visibleColumns.map((c) => c.name));

    if (before !== after && this._initialized == true)
    {
      this.pluginsHandler.visibleColumnsChanged$.next(this.visibleColumns);
    }
  }

  private init(config: TableConfig<T>) {
    this.allColumns = [...config.columns]; // to avoid mutation of original collection
    this.calculateVisibleColumns();
    this.initializeSorting(config.defaultSorting);
    this._initialized = true;
    this.pluginsHandler.tableInitialized$.next()
  }
}

