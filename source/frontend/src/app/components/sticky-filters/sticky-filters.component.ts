import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  StickyFilter,
  StickyFilterDefinition,
  StickyFilterItem, StickyFilters, StoringStickyFilters
} from "@components/sticky-filters/sticky-filters.model";
import { filtersStorageName } from "@app/modules/expenses/pages/expenses-page/expenses-page.component";

@Component({
  selector: 'app-sticky-filters',
  templateUrl: './sticky-filters.component.html',
  styleUrls: ['./sticky-filters.component.scss']
})
export class StickyFiltersComponent implements OnInit {
  @Input()
  definitions: Record<string, StickyFilterDefinition<any>>;

  @Input()
  storageKey?: string;

  @Output()
  filtersChanged = new EventEmitter<StoringStickyFilters>();

  stickyFilters: StickyFilters = {};

  originalOrder = (): number => {
    return 0;
  }

  private get filters(): StoringStickyFilters {
    const filtersToStore: StoringStickyFilters = {};

    Object.keys(this.stickyFilters).forEach((filter) => {
      const stickyFilter = this.stickyFilters[filter];
      if (stickyFilter != null && stickyFilter.selectedValue.length > 0) {
        filtersToStore[filter] = stickyFilter.definition.multiselect
          ? stickyFilter.selectedValue
          : stickyFilter.selectedValue[0]
      }
    });

    return filtersToStore;
  }

  ngOnInit(): void {
    if (this.storageKey) {
      this.restoreStickyFilters()
    }
  }

  onStickyFilterChanged<T>(stickyFilter: StickyFilter<T>, value: StickyFilterItem<T>[]) {
    stickyFilter.selectedValue = value;
    this.handleChangedFilters();
  }

  addStickyFilter(stickyFilterName: string) {
    if (this.stickyFilters[stickyFilterName] == null) {
      const definition = this.definitions[stickyFilterName];

      if (definition != null) {
        this.stickyFilters[stickyFilterName] = {
          definition,
          selectedValue: [definition.defaultValue]
        };
      }

      this.handleChangedFilters();
    }
  }

  onStickyFilterRemoved(stickyFilterName: string) {
    if (this.stickyFilters[stickyFilterName] != null) {
      const adjustedFiltersList: StickyFilters = {};

      Object.keys(this.stickyFilters).forEach((key) => {
        if (key !== stickyFilterName) {
          adjustedFiltersList[key] = this.stickyFilters[key];
        }
      });

      this.stickyFilters = adjustedFiltersList;
      this.handleChangedFilters();
    }
  }

  private handleChangedFilters() {
    const filters = this.filters;

    if (this.storageKey) {
      localStorage.setItem(filtersStorageName, JSON.stringify(filters));
    }

    this.filtersChanged.emit(filters);
  }

  private restoreStickyFilters() {
    const savedFilters = localStorage.getItem(filtersStorageName);

    if (savedFilters != null) {
      const storedFilters = JSON.parse(savedFilters) as StoringStickyFilters;

      Object.keys(storedFilters).forEach((key) => {
        if (this.stickyFilters[key] == null) {
          const definition = this.definitions[key];

          const value = storedFilters[key];
          if (definition != null && value != null) {
            if (Array.isArray(value)) {
              this.stickyFilters[key] = {
                definition,
                selectedValue: value
              };
            } else {
              this.stickyFilters[key] = {
                definition,
                selectedValue: [value]
              };
            }
          }
        }
      });
    }
  }
}
