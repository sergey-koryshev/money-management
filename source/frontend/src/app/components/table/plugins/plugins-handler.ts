import { Subject, takeUntil } from "rxjs";
import { TableComponent } from "../table.component";
import { TablePlugin } from "./plugin.model";
import { SortDescriptor, SortDirection, TableColumn } from "../table.model";

export class PluginsHandler<T> {
  private destroy$ = new Subject<void>();

  plugins: TablePlugin<T>[];
  table: TableComponent<T>;

  tableInitialized$ = new Subject<void>();
  columnsReordered$ = new Subject<TableColumn<T>[]>();
  visibleColumnsChanged$ = new Subject<TableColumn<T>[]>();
  sortingChanged$ = new Subject<SortDescriptor | undefined>();

  constructor (plugins: TablePlugin<T>[], table: TableComponent<T>) {
    this.plugins = plugins;
    this.table = table;
  }

  init() {
    this.plugins.forEach((p) => {
      try {
        p.init(this.table);
        this.wire(p);
      } catch (err) {
        console.error(`Error has occurred while initializing plugin '${p.name}': ${err}`);
      }
    })
  }

  destroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private wire(plugin: TablePlugin<T>) {
    this.tableInitialized$.pipe(takeUntil(this.destroy$))
      .subscribe(() => plugin.onTableInitialized())
    this.columnsReordered$.pipe(takeUntil(this.destroy$))
      .subscribe((columns) => plugin.onColumnsReordered(columns))
    this.visibleColumnsChanged$.pipe(takeUntil(this.destroy$))
      .subscribe((columns) => plugin.onVisibleColumnsChanged(columns))
    this.sortingChanged$.pipe(takeUntil(this.destroy$))
      .subscribe((descriptor) => plugin.onSortingChanged(descriptor))
  }
}
