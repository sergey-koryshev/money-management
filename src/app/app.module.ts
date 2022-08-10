import { CurrencyService } from '@services/currency.service';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { APP_INITIALIZER } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ComponentsModule } from './components/components.module';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    ComponentsModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (currencyService: CurrencyService) => () => currencyService.load(),
      deps: [CurrencyService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
