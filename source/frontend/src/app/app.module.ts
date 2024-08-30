import { CurrencyService } from '@services/currency.service';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { APP_INITIALIZER } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { LayoutModule } from './layout/layout.module';
import { UserService } from './services/user.service';
import { AuthInterceptor } from './interceptors/auth.interceptor';

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
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (userService: UserService) => () => userService.initialize(),
      deps: [UserService],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (currencyService: CurrencyService) => () => currencyService.initialize(),
      deps: [CurrencyService],
      multi: true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
