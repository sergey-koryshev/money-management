import { Expense } from '@app/models/expense.model';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-expanses-page',
  templateUrl: './expanses-page.component.html',
  styleUrls: ['./expanses-page.component.scss']
})
export class ExpansesPageComponent implements OnInit {

  expenses: Expense[];

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.data.subscribe((data) => this.expenses = data.expenses ?? []);
  }
}
