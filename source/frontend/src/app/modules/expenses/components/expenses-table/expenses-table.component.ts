import { ExpensesHttpClientService } from '@http-clients/expenses-http-client.service';
import { SortDescriptor, TableConfig } from '@components/table/table.model';
import { Component, EventEmitter, Injectable, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { Expense } from '@app/models/expense.model';
import { priceComparer } from '@app/helpers/comparers.helper';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Month } from '@app/models/month.model';
import { ItemChange } from './expenses-table.model';
import { AmbiguousUser, User } from '@app/models/user.model';
import { getUserFullName, getUserInitials } from '@app/helpers/users.helper';
import { UserConnectionStatus } from '@app/models/enums/user-connection-status.enum';
import { UserService } from '@app/services/user.service';
import { FailureType } from '@app/models/enums/failure-type.enum';
import { ExpensesService } from '../../expenses.service';
import { StoringExpensesStickyFilters } from '../../pages/expenses-page/expenses-page.model';
import { BehaviorSubject } from 'rxjs';
import { TABLE_PLUGIN_TOKEN } from '@app/components/table/plugins/plugin.model';
import { LocalPreferencesPlugin } from '@app/components/table/plugins/local-preferences.plugin';

@Injectable()
export class ExpensePreferencesPlugin extends LocalPreferencesPlugin<Expense> {
  tablePreferencesName = 'ExpensesTablePreferences'
}

@Component({
  selector: 'app-expenses-table',
  templateUrl: './expenses-table.component.html',
  styleUrls: ['./expenses-table.component.scss'],
  providers: [
    {
      provide: TABLE_PLUGIN_TOKEN,
      useClass: ExpensePreferencesPlugin,
      multi: true
    }
  ]
})
export class ExpensesTableComponent {
  readonly failureType = FailureType;
  private defaultSorting: SortDescriptor = {
    column: 'date',
    direction: 'desc'
  }
  private friends: AmbiguousUser[];

  @Input()
  selectedMonth?: Month;

  @Input()
  data: Expense[]

  @Input()
  stickyFilters: StoringExpensesStickyFilters;

  @Input()
  loading = false;

  @Output()
  itemChanged = new EventEmitter<ItemChange>()

  tableConfig: TableConfig<Expense> = {
    columns: [
      {
        name: 'permittedPersons',
        ignorePadding: true,
        disableSorting: true,
        template: () => this.permittedPersons,
        hide: () => this.isPermittedUsersColumnVisible()
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
      }
    ],
    defaultSorting: this.defaultSorting,
    floatingMenuItems: [
      {
        title: 'Edit',
        disabled: (row) => !this.canRowBeEdited(row),
        action: (row) => this.editItem(row)
      },
      {
        title: 'Duplicate',
        action: (row) => this.duplicateItem(row)
      },
      {
        title: 'Delete',
        action: (row) => this.removeItem(row)
      },
    ],
    enableColumnsDrag: true,
    trackBy: (_, e) => e.id
  };

  sorting = this.defaultSorting;
  currentUser: User | null;

  @ViewChild('price', { read: TemplateRef, static: true })
  price: TemplateRef<unknown>;

  @ViewChild('actions', { read: TemplateRef, static: true })
  actions: TemplateRef<unknown>;

  @ViewChild('permittedPersons', { read: TemplateRef, static: true })
  permittedPersons: TemplateRef<unknown>;

  @ViewChild('exchangeResult', { read: TemplateRef, static: true })
  exchangeResult: TemplateRef<unknown>;

  constructor(
    private expensesHttpClient: ExpensesHttpClientService,
    private modalService: NgbModal,
    userService: UserService,
    private expensesService: ExpensesService) {
    this.currentUser = userService.user;
    userService.connections$.subscribe((connections) => this.friends = connections.filter((c) => c.status === UserConnectionStatus.accepted).map((c) => c.person));
  }

  editItem(item?: Expense) {
    this.expensesService.openEditExpenseDialog(item, this.data, this.selectedMonth, this.stickyFilters).subscribe((change) => {
      if (change != null) {
        this.itemChanged.emit(change);
      }
    });
  }

  duplicateItem(item?: Expense) {
    this.expensesService.openAddExpenseDialog(item, this.data, this.selectedMonth, this.stickyFilters).subscribe((change) => {
      if (change != null) {
        this.itemChanged.emit(change);
      }
    });
  }

  removeItem(item?: Expense) {
    this.expensesService.openRemoveExpenseDialog(item, this.data).subscribe((change) => {
      if (change != null) {
        this.itemChanged.emit(change);
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

  canRowBeEdited(row?: Expense) {
    if (row == null) {
      return false;
    }

    if (this.currentUser == null) {
      return false;
    }

    return row.createdBy.id == this.currentUser.id || this.friends.some((f) => f.id === row.createdBy.id)
  }

  private isPermittedUsersColumnVisible(): boolean {
    if (this.currentUser == null) {
      return false;
    }

    return this.data?.filter((e) => e.createdBy.id != this.currentUser!.id).length > 0 ||
      this.data?.filter((e) => e.permittedPersons.length > 0).length > 0;
  }
}
