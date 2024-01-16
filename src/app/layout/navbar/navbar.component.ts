import { CurrencyService } from '@services/currency.service';
import { Component } from '@angular/core';
import { Currency } from '@models/currency.model';
import { User } from '@models/user.model';
import { emptyMainCurrency } from 'src/app/constants';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { LoginHttpClient } from '@app/http-clients/login-http-client.service';
import { UserConnectionStatus } from '@app/models/enums/user-connection-status.enum';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  currencies: Currency[];
  mainCurrency: Currency | null;
  user: User | null;
  emptyMainCurrency = emptyMainCurrency;
  searchForm: FormGroup;
  pendingConnections: number = 0;

  get defaultUser(): User {
    return {
      id: 0,
      tenant: '8eeb9d4b-d246-4075-a53a-fa31184f71ec',
      firstName: 'Sign In',
      connections: []
    };
  }

  constructor(private currencyService: CurrencyService, private router: Router, fb: FormBuilder, private authService: AuthService, private loginHttpClient: LoginHttpClient) {
    this.currencyService.currencies$.subscribe((currencies) => this.currencies = currencies);
    this.currencyService.mainCurrency$.subscribe((currency) => this.mainCurrency = currency)
    authService.user$.subscribe((user) => {
      this.user = user;
      if (user) {
        this.pendingConnections = user.connections.filter((c) => c.status === UserConnectionStatus.pending).length;
      }
    });
    this.searchForm = fb.group({
      text: ['', Validators.required]
    });
   }

  setMainCurrency(currency: Currency) {
    this.currencyService.setMainCurrency({currencyId: currency.id});
  }

  removeMainCurrency() {
    this.currencyService.removeMainCurrency();
  }

  onSearchFormSubmit() {
    this.router.navigate(['expenses/search'], {
      queryParams: this.searchForm.value
    });
  }

  onLogout() {
    this.loginHttpClient.logout().subscribe(() => {
      this.authService.removeUser();
      this.router.navigate(['/']);
    });
  }
}
