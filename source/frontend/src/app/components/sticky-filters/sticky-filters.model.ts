import { Observable } from "rxjs"

export enum StickyFilterType {
  list,
  dropdown
}

export interface StickyFilterItem<T> {
  name: string
  value: T
}

export interface StickyFilter<T> {
  definition: StickyFilterDefinition<T>
  selectedValue: StickyFilterItem<T>[]
}

export interface ListStickyFilter<T> extends StickyFilterDefinitionBase<T> {
  type: StickyFilterType.list
  items: StickyFilterItem<T>[]
}

export interface DropdownStickyFilter<T> extends StickyFilterDefinitionBase<T> {
  type: StickyFilterType.dropdown
  source?: Observable<StickyFilterItem<T>[]>
  searchFunc?: (entry: string) => Observable<StickyFilterItem<T>[]>
  placeholder?: string
}

export type StickyFilterDefinition<T> = ListStickyFilter<T> | DropdownStickyFilter<T>

export interface StickyFilterDefinitionBase<T> {
  type: StickyFilterType
  name: string
  displayName: string
  defaultValue: StickyFilterItem<T>
  multiselect: boolean
  allItem?: StickyFilterItem<T>
}

export type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
}

export type StoringStickyFilters = PartialRecord<string, StickyFilterItem<any> | StickyFilterItem<any>[]>;

export type StickyFilters = PartialRecord<string, StickyFilter<any>>;
