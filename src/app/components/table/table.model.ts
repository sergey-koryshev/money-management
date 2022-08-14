import { TemplateRef } from "@angular/core";

export interface TableColumn<T> {
    name: string,
    displayName: string,
    function?: (row: T) => string,
    template?: () => TemplateRef<unknown>;
}

export enum TableColumnType {
    text,
    function,
    template
}