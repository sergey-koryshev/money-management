import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {StickyFilterDefinition, StickyFilterItem, StickyFilterType} from "@components/sticky-filters/sticky-filters.model";
import {NgSelectComponent} from "@ng-select/ng-select";
import {tap} from "rxjs/operators";

interface ExtendedStickyFilterItem extends StickyFilterItem<any> {
  active?: boolean;
}

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
  items: ExtendedStickyFilterItem[];
  visibleDropdownItems: StickyFilterItem<any>[];
  dropdownLoading = false;

  onListItemClicked(item: StickyFilterItem<any>) {
    if (this.definition.multiselect) {
      // removing All Item from list of selected values
      if (this.definition.allItem != null && this.selectedValue.some((x) => this.compareItems(x, this.definition.allItem!))) {
        this.selectedValue = this.selectedValue.filter((x) => !this.compareItems(x, this.definition.allItem!));
      }

      // remove or add item to list of selected ones
      if (this.selectedValue.some((x) => this.compareItems(x, item))) {
        this.selectedValue = this.selectedValue.filter((x) => !this.compareItems(x, item));
      } else {
        if (this.definition.allItem != null && this.compareItems(item, this.definition.allItem)) {
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
      if (this.definition.allItem != null && this.selectedValue.some((x) => this.compareItems(x, this.definition.allItem!))) {
        this.selectedValue = this.selectedValue.filter((x) => !this.compareItems(x, this.definition.allItem!));
      }

      // add value if it's not added already
      if (this.definition.multiselect) {
        if (!this.selectedValue.some((x) => this.compareItems(x, value))) {
          this.selectedValue.push(value);
        }
      } else {
        this.selectedValue = [value];
      }

      element?.writeValue([]);
      this.adjustVisibleDropdownItems();
      this.filterChanged.emit(this.selectedValue);
    }
  }

  onDropdownElementClicked(item: StickyFilterItem<any>) {
    // removing item
    this.selectedValue = this.selectedValue.filter((x) => !this.compareItems(x, item));

    // set to default value if not items left
    if (this.selectedValue.length === 0) {
      this.selectedValue = [this.definition.defaultValue];
    }

    this.adjustVisibleDropdownItems();
    this.filterChanged.emit(this.selectedValue);
  }

  ngOnInit(): void {
    if (this.definition.type === StickyFilterType.list) {
      this.items = this.definition.items;
    }

    if (this.definition.type === StickyFilterType.dropdown) {
      this.definition.source.pipe(
        (tap(() => this.dropdownLoading = true))
      ).subscribe({
        next: (items) => {
          this.items = items;
          this.adjustVisibleDropdownItems();
        }
      }).add(() => this.dropdownLoading = false)
    }
  }

  /**
   * Adjusts visible items in dropdown to hide selected ones
   * @private
   */
  private adjustVisibleDropdownItems() {
    this.visibleDropdownItems = this.items.filter((i) => !this.selectedValue.some((x) => this.compareItems(x, i)))
  }

  private compareItems (a: StickyFilterItem<any>, b: StickyFilterItem<any>) {
    return a.value === b.value && a.name === b.name;
  }

  isItemActive(item: ExtendedStickyFilterItem) {
    return this.selectedValue.some((v) => this.compareItems(v, item));
  }
}
