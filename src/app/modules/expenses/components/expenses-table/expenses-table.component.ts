import { ExpensesHttpClientService } from '@http-clients/expenses-http-client.service';
import { SortEvent, TableColumn } from '@components/table/table.model';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { Expense } from '@app/models/expense.model';
import { priceComparer } from '@app/helpers/comparers.helper';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EditExpenseDialogComponent } from '../edit-expense-dialog/edit-expense-dialog.component';
import { Month } from '@app/models/month.model';
import { ItemChangedEventArgs } from './expenses-table.model';
import { PolyUser } from '@app/models/user.model';
import { ExpenseViewType } from '@app/models/enums/expense-view-type.enum';
import { getUserFullName, getUserInitials } from '@app/helpers/users.helper';

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
      name: 'item',
      displayName: 'Item'
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
      name: 'sharedWith',
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

  @ViewChild('price', { read: TemplateRef, static: true })
  price: TemplateRef<unknown>;

  @ViewChild('actions', { read: TemplateRef, static: true })
  actions: TemplateRef<unknown>;

  @ViewChild('sharedWith', { read: TemplateRef, static: true })
  sharedWithTemplate: TemplateRef<unknown>;

  @ViewChild('confirmationDialog', { read: TemplateRef, static: true })
  confirmationDialog: TemplateRef<unknown>;

  constructor(private expensesHttpClient: ExpensesHttpClientService, private modalService: NgbModal) {}

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
                oldValue: item.exchangedPrice?.amount ?? item.price.amount
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
              || (this.viewType === ExpenseViewType.OnlyShared && updatedItem.sharedWith.length > 0)
              || (this.viewType === ExpenseViewType.OnlyNotShared && updatedItem.sharedWith.length === 0))) {
          this.data[indexOfItem] = updatedItem;
          this.itemChanged.emit({
            oldValue: item.exchangedPrice?.amount ?? item.price.amount,
            newValue: updatedItem.exchangedPrice?.amount ?? updatedItem.price.amount,
          })
        } else {
          this.data.splice(indexOfItem, 1);
          this.itemChanged.emit({
            oldValue: item.exchangedPrice?.amount ?? item.price.amount
          })
        }
      }
    });
  }

  getUserInitials(user: PolyUser): string {
    return getUserInitials(user);
  }

  getUserFullName(user: PolyUser): string {
    return getUserFullName(user);
  }

  onSortingChanged(sortingDescriptor: SortEvent) {
    localStorage.setItem(this.sortingStorageName, JSON.stringify(sortingDescriptor));
  }

  private isSharedWithColumnVisible() {
    return this.data?.filter((e) => e.sharedWith.length > 0).length > 0;
  }
}
