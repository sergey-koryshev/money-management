import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StickyFilterDefinition, StickyFilterItem, StickyFilterType } from "@components/sticky-filters/sticky-filters.model";
import { NgSelectComponent } from "@ng-select/ng-select";
import { catchError, switchMap, tap } from "rxjs/operators";
import { stickyFilterItemsComparer } from "@app/helpers/comparers.helper";
import { Observable, of, Subject } from 'rxjs';

@Component({
  selector: 'app-sticky-filter',
  templateUrl: './sticky-filter.component.html',
  styleUrls: ['./sticky-filter.component.scss']
})
export class StickyFilterComponent implements OnInit {
  @Input()
  definition: StickyFilterDefinition<any>;

  @Input()
  selectedValue: StickyFilterItem<any>[];

  @Output()
  filterRemoved = new EventEmitter<void>();

  @Output()
  filterChanged = new EventEmitter<StickyFilterItem<any>[]>();

  stickyFilterType = StickyFilterType;
  items: StickyFilterItem<any>[];
  dropdownLoading = false;
  visibleDropdownItems$: Observable<StickyFilterItem<any>[] | never[]> = of([]);
  searchEntry$ = new Subject<string>();
  visibleItemsChanged$ = new Subject<void>();

  ngOnInit(): void {
    if (this.definition.type === StickyFilterType.list) {
      this.items = this.definition.items;
    }

    if (this.definition.type === StickyFilterType.dropdown) {
      if (this.definition.source != null) {
        this.visibleDropdownItems$ = this.visibleItemsChanged$.pipe(
          switchMap(() => of(this.getVisibleDropdownItems(this.items))));

        this.definition.source.pipe(
          (tap(() => this.dropdownLoading = true))
        ).subscribe({
          next: (items) => {
            this.items = items;
            this.visibleItemsChanged$.next();
          }
        }).add(() => this.dropdownLoading = false);
      } else if (this.definition.searchFunc != null) {
        const searchFunc = this.definition.searchFunc;
        this.visibleDropdownItems$ = this.searchEntry$.pipe(
          tap(() => this.dropdownLoading = true),
          switchMap((entry) => searchFunc(entry).pipe(
            catchError(() => of([])),
            tap(() => this.dropdownLoading = false)
          )),
          switchMap((foundItems) => of(this.getVisibleDropdownItems(foundItems))));
      }
    }
  }

  onListItemClicked(item: StickyFilterItem<any>) {
    if (this.definition.multiselect) {
      // removing All Item from list of selected values
      if (this.definition.allItem != null && this.selectedValue.some((x) => stickyFilterItemsComparer(x, this.definition.allItem!))) {
        this.selectedValue = this.selectedValue.filter((x) => !stickyFilterItemsComparer(x, this.definition.allItem!));
      }

      // remove or add item to list of selected ones
      if (this.selectedValue.some((x) => stickyFilterItemsComparer(x, item))) {
        this.selectedValue = this.selectedValue.filter((x) => !stickyFilterItemsComparer(x, item));
      } else {
        if (this.definition.allItem != null && stickyFilterItemsComparer(item, this.definition.allItem)) {
          this.selectedValue = [this.definition.allItem];
        } else {
          this.selectedValue.push(item);
        }
      }

      // select default item if no items selected
      if (this.selectedValue.length === 0) {
        this.selectedValue = [this.definition.defaultValue];
      }
    } else {
      this.selectedValue = [item];
    }

    this.filterChanged.emit(this.selectedValue);
  }

  onDropdownChanged(values: StickyFilterItem<any>[], element: NgSelectComponent) {
    if (values.length > 0) {
      const value = values[0];

      // removing All Item from list of selected values
      if (this.definition.allItem != null && this.selectedValue.some((x) => stickyFilterItemsComparer(x, this.definition.allItem!))) {
        this.selectedValue = this.selectedValue.filter((x) => !stickyFilterItemsComparer(x, this.definition.allItem!));
      }

      // add value if it's not added already
      if (this.definition.multiselect) {
        if (!this.selectedValue.some((x) => stickyFilterItemsComparer(x, value))) {
          this.selectedValue.push(value);
        }
      } else {
        this.selectedValue = [value];
      }

      element?.writeValue([]);
      this.visibleItemsChanged$.next();
      this.filterChanged.emit(this.selectedValue);
    }
  }

  onDropdownElementClicked(item: StickyFilterItem<any>) {
    // removing item
    this.selectedValue = this.selectedValue.filter((x) => !stickyFilterItemsComparer(x, item));

    // set to default value if not items left
    if (this.selectedValue.length === 0) {
      this.selectedValue = [this.definition.defaultValue];
    }

    this.visibleItemsChanged$.next();
    this.filterChanged.emit(this.selectedValue);
  }

  isItemActive(item: StickyFilterItem<any>) {
    return this.selectedValue.some((v) => stickyFilterItemsComparer(v, item));
  }

  private getVisibleDropdownItems(itemsToFilter: StickyFilterItem<any>[]) {
    return itemsToFilter.filter((i) => !this.selectedValue.some((x) => stickyFilterItemsComparer(x, i)))
  }
}
