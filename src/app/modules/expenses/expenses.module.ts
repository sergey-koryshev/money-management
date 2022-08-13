import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExpansesPageComponent } from './pages/expanses-page/expanses-page.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: ExpansesPageComponent,
  },
];

@NgModule({
  declarations: [ExpansesPageComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class ExpansesModule {}
