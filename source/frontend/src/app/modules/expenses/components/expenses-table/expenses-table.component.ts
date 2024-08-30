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
import { ExpenseViewType } from '@app/models/enums/expense-view-type.enum';
import { getUserFullName, getUserInitials } from '@app/helpers/users.helper';
import { UserConnectionStatus } from '@app/models/enums/user-connection-status.enum';
import { UserService } from '@app/services/user.service';

@Component({
  selector: 'app-expenses-table',
  templateUrl: './expenses-table.component.html',
  styleUrls: ['./expenses-table.component.scss']
})
export class ExpensesTableComponent implements OnInit {
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
  viewType: ExpenseViewType;

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
      name: 'price',
      displayName: 'Price',
      template: () => this.price,
      sortFunc: priceComparer
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
                oldValue: item.originalPrice?.amount ?? item.price.amount
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
            && (this.viewType === ExpenseViewType.All
              || (this.viewType === ExpenseViewType.OnlyShared && updatedItem.permittedPersons.length > 0)
              || (this.viewType === ExpenseViewType.OnlyNotShared && updatedItem.permittedPersons.length === 0))) {
          this.data[indexOfItem] = updatedItem;
          this.itemChanged.emit({
            oldValue: item.originalPrice?.amount ?? item.price.amount,
            newValue: updatedItem.originalPrice?.amount ?? updatedItem.price.amount,
          })
        } else {
          this.data.splice(indexOfItem, 1);
          this.itemChanged.emit({
            oldValue: item.originalPrice?.amount ?? item.price.amount
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
