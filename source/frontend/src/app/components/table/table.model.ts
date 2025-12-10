import { TemplateRef } from "@angular/core";

export interface TableColumn<T> {
  name: string,
  displayName?: string,
  minWidth?: string,
  stretch?: boolean,
  ignorePadding?: boolean,
  disableSorting?: boolean,
  snapToPrevious?: boolean,
  function?: (row: T) => string,
  template?: () => TemplateRef<unknown>;
  sortFunc?: (first: T, second: T) => number;
  hide?: () => boolean
}

export enum TableColumnType {
  text,
  function,
  template
}

export type SortDirection = 'asc' | 'desc' | '';

export interface SortEvent {
    column: string;
    direction: SortDirection;
}

export interface TableMenuItem<T> {
  title: string;
  action: (row?: T) => void;
  disabled?: boolean | ((value?: T | any) => boolean);
  visible?: boolean | ((value?: T) => boolean);
}
