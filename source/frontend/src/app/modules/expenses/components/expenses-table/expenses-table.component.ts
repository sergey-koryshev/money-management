import { ExpensesHttpClientService } from '@http-clients/expenses-http-client.service';
import { SortEvent, TableColumn } from '@components/table/table.model';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { Expense } from '@app/models/expense.model';
import { priceComparer } from '@app/helpers/comparers.helper';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EditExpenseDialogComponent } from '../edit-expense-dialog/edit-expense-dialog.component';
import { Month } from '@app/models/month.model';
import { ItemChangedEventArgs } from './expenses-table.model';
import { AmbiguousUser, User } from '@app/models/user.model';
import { getUserFullName, getUserInitials } from '@app/helpers/users.helper';
import { UserConnectionStatus } from '@app/models/enums/user-connection-status.enum';
import { UserService } from '@app/services/user.service';
import { ExpensesFilters } from '../../pages/expenses-page/expenses-filters.model';
import { emptyFilter } from '../../pages/expenses-page/expenses-page.component';
import { SharedFilterOptions } from '@app/models/enums/shared-filter.enum';
import { FailureType } from '@app/models/enums/failure-type.enum';

@Component({
  selector: 'app-expenses-table',
  templateUrl: './expenses-table.component.html',
  styleUrls: ['./expenses-table.component.scss']
})
export class ExpensesTableComponent implements OnInit {
  readonly failureType = FailureType;
  private sortingStorageName = 'expenses-table-sorting';
  private defaultSorting: SortEvent = {
    column: 'date',
    direction: 'desc'
  }
  private friends: AmbiguousUser[];

  @Input()
  selectedMonth?: Month;

  @Input()
  data: Expense[];

  @Input()
  filters: ExpensesFilters;

  @Output()
  itemChanged = new EventEmitter<ItemChangedEventArgs>()

  columns: TableColumn<Expense>[] = [
    {
      name: 'createdBy',
      ignorePadding: true,
      disableSorting: true,
      template: () => this.createdByTemplate,
      hide: () => this.isCreatedByColumnVisible()
    },
    {
      name: 'date',
      displayName: 'Date',
      function: (row) => new Date(row.date).toLocaleDateString()
    },
    {
      name: 'category',
      displayName: 'Category',
      function: (row) => row.category ? row.category.name : '-',
      sortFunc: (f, s) => {
        return (f.category
          ? f.category.name
          : '').localeCompare(s.category
            ? s.category.name
            : '');
      }
    },
    {
      name: 'name',
      displayName: 'Name'
    },
    {
      name: 'description',
      displayName: 'Description',
      stretch: true
    },
    {
      name: 'exchangeResult',
      template: () => this.exchangeResult,
      disableSorting: true,
      ignorePadding: true
    },
    {
      name: 'price',
      displayName: 'Price',
      template: () => this.price,
      sortFunc: priceComparer,
      snapToPrevious: true
    },
    {
      name: 'permittedPersons',
      ignorePadding: true,
      disableSorting: true,
      template: () => this.sharedWithTemplate,
      hide: () => this.isSharedWithColumnVisible()
    },
    {
      name: 'actions',
      ignorePadding: true,
      disableSorting: true,
      template: () => this.actions
    }
  ];

  sorting = this.defaultSorting;
  currentUser: User | null;

  @ViewChild('price', { read: TemplateRef, static: true })
  price: TemplateRef<unknown>;

  @ViewChild('actions', { read: TemplateRef, static: true })
  actions: TemplateRef<unknown>;

  @ViewChild('createdBy', { read: TemplateRef, static: true })
  createdByTemplate: TemplateRef<unknown>;

  @ViewChild('sharedWith', { read: TemplateRef, static: true })
  sharedWithTemplate: TemplateRef<unknown>;

  @ViewChild('confirmationDialog', { read: TemplateRef, static: true })
  confirmationDialog: TemplateRef<unknown>;

  @ViewChild('exchangeResult', { read: TemplateRef, static: true })
  exchangeResult: TemplateRef<unknown>;

  constructor(private expensesHttpClient: ExpensesHttpClientService, private modalService: NgbModal, userService: UserService) {
    this.currentUser = userService.user;
    userService.connections$.subscribe((connections) => this.friends = connections.filter((c) => c.status === UserConnectionStatus.accepted).map((c) => c.person));
  }

  ngOnInit(): void {
    var storedSorting = localStorage.getItem(this.sortingStorageName);

    if (storedSorting != null) {
      this.sorting = JSON.parse(storedSorting) as SortEvent;
    }
  }

  removeItem(item: Expense) {
    this.modalService.open(this.confirmationDialog).closed.subscribe((res: boolean) => {
      if (res) {
        const indexOfItem = this.data.indexOf(item);

        if (item.id != null) {
          this.expensesHttpClient.removeExpense(item.id).subscribe({
            complete: () => {
              this.data.splice(indexOfItem, 1);
              this.itemChanged.emit({
                oldPrice: item.price
              });
            },
            error: (ex) => {
              console.log(`Error has occurred while deleting item: ${ex.message}`)
            }});
        } else {
          this.data.splice(indexOfItem, 1);
        }
      }
    });
  }

  editItem(item: Expense) {
    const modalRef = this.modalService.open(EditExpenseDialogComponent);
    modalRef.componentInstance.item = {...item, date: new Date(item.date)};
    modalRef.closed.subscribe((updatedItem: Expense) => {
      const date = new Date(updatedItem.date)
      const indexOfItem = this.data.findIndex((e) => e.id === updatedItem.id);

      if (indexOfItem >= 0) {
        if (this.selectedMonth == null
          || (this.selectedMonth.month == date.getMonth() + 1
            && this.selectedMonth.year == date.getFullYear())
            && (this.filters.shared.value === emptyFilter.value
              || (this.filters.shared.value === SharedFilterOptions.Yes && updatedItem.permittedPersons.length > 0)
              || (this.filters.shared.value === SharedFilterOptions.No && updatedItem.permittedPersons.length === 0))) {
          this.data[indexOfItem] = updatedItem;
          this.itemChanged.emit({
            oldPrice: item.price,
            newPrice: updatedItem.price,
          })
        } else {
          this.data.splice(indexOfItem, 1);
          this.itemChanged.emit({
            oldPrice: item.price
          })
        }
      }
    });
  }

  getUserInitials(user: AmbiguousUser): string {
    return getUserInitials(user);
  }

  getUserFullName(user: AmbiguousUser): string {
    if (user.id == this.currentUser?.id) {
      return "You";
    }

    return getUserFullName(user);
  }

  onSortingChanged(sortingDescriptor: SortEvent) {
    localStorage.setItem(this.sortingStorageName, JSON.stringify(sortingDescriptor));
  }

  canRowBeEdited(row: Expense) {
    if (this.currentUser == null) {
      return false;
    }

    return row.createdBy.id == this.currentUser.id || this.friends.some((f) => f.id === row.createdBy.id)
  }

  private isCreatedByColumnVisible(): boolean {
    if (this.currentUser == null) {
      return false;
    }

    return this.data?.filter((e) => e.createdBy.id != this.currentUser!.id).length > 0;
  }

  private isSharedWithColumnVisible() {
    return this.data?.filter((e) => e.permittedPersons.length > 0).length > 0;
  }
}
