import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginHttpClient } from '@app/http-clients/login-http-client.service';
import { AuthService } from '@app/services/auth.service';
import { CurrencyService } from '@app/services/currency.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit {

  @Output()
  signedIn = new EventEmitter();

  form: FormGroup;
  error: string | null;

  constructor(private fb: FormBuilder, private authService: AuthService, private loginHttpClient: LoginHttpClient, private router: Router) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      'email': [null, Validators.required],
      'password': [null, Validators.required]
    });
  }

  onSubmit() {
    const {email, password} = this.form.value;
    this.loginHttpClient.login(email, password).subscribe({
      next: (user) => {
        this.error = null;
        this.authService.saveUser(user);
        this.signedIn.emit();
        this.router.navigate(['expenses']);
      },
      error: (err) => this.error = err.error.data ?? err.error.message})
  }
}
