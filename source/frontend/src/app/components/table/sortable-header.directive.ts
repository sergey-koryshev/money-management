import { ChangeDetectionStrategy, Component, Directive, ElementRef, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { SortDirection, SortEvent } from './table.model';

@Component({
  selector: 'th[sortable]',
  template: `<ng-content></ng-content>`,
  styleUrls: ['./sortable-header.directive.scss'],
  host: {
    '[class.hand-cursor]': 'disableSorting === false',
    '[class.asc]': 'direction === "asc" && disableSorting === false',
    '[class.desc]': 'direction === "desc" && disableSorting === false',
    '(click)': 'disableSorting === false ? rotate() : null'
  },
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortableHeaderDirective {

  @Input() sortable: string = '';
  @Input() direction: SortDirection = '';
  @Input() disableSorting: boolean = false;
  @Output() sort = new EventEmitter<SortEvent>();

  rotateSortDirection: {[key: string]: SortDirection} = { 'asc': 'desc', 'desc': '', '': 'asc' };

  rotate() {
    this.direction = this.rotateSortDirection[this.direction];
    this.callSortEvent({column: this.sortable, direction: this.direction});
  }

  callSortEvent(sortEvent: SortEvent) {
    this.sort.emit(sortEvent);
  }
}
