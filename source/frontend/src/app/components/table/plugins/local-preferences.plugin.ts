import { Injectable } from "@angular/core";
import { TableComponent } from "../table.component";
import { SortDescriptor, TableColumn } from "../table.model";
import { TableUserPreferences } from "./local-preferences.models";
import { TablePlugin } from "./plugin.model";

@Injectable()
export class LocalPreferencesPlugin<T> implements TablePlugin<T> {
  readonly name = 'LocalPreferencesPlugin';

  private table?: TableComponent<T>;

  tablePreferencesName?: string;

  init(table: TableComponent<T>) {
    this.table = table;
  }

  onTableInitialized() {
    this.applyPreferences();
  }

  onColumnsReordered(_: TableColumn<T>[]) {
    this.savePreferences();
  }

  onVisibleColumnsChanged(_: TableColumn<T>[]) {
    this.applyPreferences()
  }

  onSortingChanged(_: SortDescriptor | undefined) {
    this.savePreferences()
  }

  private applyPreferences() {
    const preferences = this.getPreferences();

    if (!preferences) {
      return;
    }

    this.reorderColumns(preferences);
    this.sortTable(preferences);
  }

  private getPreferences() {
    if (!this.tablePreferencesName) {
      return;
    }

    const preferencesJson = localStorage.getItem(this.tablePreferencesName);

    if (preferencesJson) {
      try {
        const tablePreferences = JSON.parse(preferencesJson) as TableUserPreferences;

        if (tablePreferences) {
          return tablePreferences;
        }
      } catch (ex) {
        console.warn(`Error occurred while reading table preferences '${this.tablePreferencesName}'`);
      }
    }

    return {
      columnsOrder: this.table?.visibleColumns.map((c) => c.name),
      sorting: this.table?.currentSorting
    } as TableUserPreferences
  }

  private savePreferences() {
    if (!this.table || !this.tablePreferencesName) {
      return;
    }

    try {
      const preferences = (this.getPreferences() ?? {}) as TableUserPreferences;
      preferences.columnsOrder = this.table.visibleColumns.map((c) => c.name);
      preferences.sorting = this.table.currentSorting;

      localStorage.setItem(this.tablePreferencesName, JSON.stringify(preferences));
    } catch (ex) {
      console.warn(`Error occurred while saving table preferences '${this.tablePreferencesName}'`);
    }
  }

  private reorderColumns(preferences: TableUserPreferences) {
    if (!this.table) {
      return;
    }

    this.table.reorderColumns(preferences.columnsOrder, true);
  }

  private sortTable(preferences: TableUserPreferences) {
    if (!this.table) {
      return;
    }

    this.table.initializeSorting(preferences.sorting, true);
  }
}
