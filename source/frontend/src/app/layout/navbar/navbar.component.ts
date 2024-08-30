import { CurrencyService } from '@services/currency.service';
import { Component } from '@angular/core';
import { Currency } from '@models/currency.model';
import { User } from '@models/user.model';
import { emptyMainCurrency } from 'src/app/constants';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '@app/services/user.service';
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
  pendingConnectionsCount = 0;

  get defaultUser(): User {
    return {
      id: 0,
      tenant: '8eeb9d4b-d246-4075-a53a-fa31184f71ec',
      firstName: 'Sign In'
    };
  }

  constructor(private currencyService: CurrencyService,
    private router: Router,
    fb: FormBuilder,
    private userService: UserService,
    private loginHttpClient: LoginHttpClient) {
    this.currencyService.currencies$.subscribe((currencies) => this.currencies = currencies);
    this.currencyService.mainCurrency$.subscribe((currency) => this.mainCurrency = currency)
    this.userService.user$
      .subscribe({
        next: (user) => this.user = user
      });
    this.userService.connections$
      .subscribe({
        next: (value) => this.pendingConnectionsCount = value.filter((c) => c.status === UserConnectionStatus.pending).length
      });
    this.searchForm = fb.group({
      text: ['', Validators.required]
    });
   }

  setMainCurrency(currency: Currency) {
    this.currencyService.setMainCurrency(currency.id);
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
      this.userService.removeUser();
      this.router.navigate(['/']);
    });
  }
}
