export enum StickyFilterType {
  list,
  autoComplete
}

export interface StickyFilterItem<T> {
  name: string
  value: T
}

export interface StickyFilterBase<T> {
  type: StickyFilterType
  name: string
  displayName: string
  selectedValue: StickyFilterItem<T>
}

export interface ListStickyFilter<T> extends StickyFilterBase<T> {
  type: StickyFilterType.list
  items: StickyFilterItem<T>[]
}

export type StickyFilter<T> = ListStickyFilter<T>


