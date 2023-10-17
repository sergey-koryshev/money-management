import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { Month } from '@app/models/month.model';

@Injectable({
  providedIn: 'root'
})
export class ExpensesMonthService {
  selectedMonthStorageName = "selected-month";
  month$: BehaviorSubject<Month>;
  get month() {
    return this.month$.value;
  }

  constructor() {
    this.month$ = new BehaviorSubject<Month>(this.getMonth());
    this.month$.subscribe((value) => this.saveMonth(value));
  }

  private getMonth(): Month {
    const selectedMonth = localStorage.getItem(this.selectedMonthStorageName);
    const currentDate = new Date();
    return selectedMonth ? JSON.parse(selectedMonth) : {
      month: currentDate.getMonth(),
      year: currentDate.getFullYear()
    };
  }

  private saveMonth(selectedMonth: Month) {
    localStorage.setItem(this.selectedMonthStorageName, JSON.stringify(selectedMonth));
  }
}
