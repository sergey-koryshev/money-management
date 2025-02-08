export enum StickyFilterType {
  list,
  autoComplete
}

export interface StickyFilterItem<T> {
  name: string
  value: T
}

export interface StickyFilter<T> {
  definition: StickyFilterDefinition<T>
  selectedValue: StickyFilterItem<T>
}

export interface ListStickyFilter<T> extends StickyFilterDefinitionBase<T> {
  type: StickyFilterType.list
  items: StickyFilterItem<T>[]
}

export interface AutoCompleteStickyFilter<T> extends StickyFilterDefinitionBase<T> {
  type: StickyFilterType.autoComplete
  source: any
}

export type StickyFilterDefinition<T> = ListStickyFilter<T> | AutoCompleteStickyFilter<T>

export interface StickyFilterDefinitionBase<T> {
  type: StickyFilterType
  name: string
  displayName: string
  defaultValue: StickyFilterItem<T>
}


