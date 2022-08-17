import { TemplateRef } from "@angular/core";

export interface TableColumn<T> {
    name: string,
    displayName: string,
    function?: (row: T) => string,
    template?: () => TemplateRef<unknown>;
    sortFunc?: (first: T, second: T) => number;
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