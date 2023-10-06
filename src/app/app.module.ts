import { CurrencyService } from '@services/currency.service';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { APP_INITIALIZER } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { LayoutModule } from './layout/layout.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    LayoutModule
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
