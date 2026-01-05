import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { TimerService } from 'src/app/shared/services/timer.service';

@Component({
  selector: 'app-reset-password-page',
  templateUrl: './reset-password-page.component.html',
  styleUrls: ['./reset-password-page.component.scss']
})
export class ResetPasswordPageComponent {
  private unsubscribe: Subscription[] = [];
  isLoading$: Observable<boolean>;
  userName: string;
  resetPasswordForm!: FormGroup;
  timeLeft!: string;
  hasError!: boolean;
  returnUrl!: string;
  isVerifyForgotPassword: boolean = false;

  constructor(
    private router: Router,
    public authService: AuthService,
    private fb: FormBuilder,

  ) {
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }

    this.isLoading$ = this.authService.isLoading$;
    this.userName =
      this.router.getCurrentNavigation()?.extras?.state?.['userName'];
    this.isVerifyForgotPassword =
      this.router.getCurrentNavigation()?.extras?.state?.['isForgotPassword'];
  }

  get f() {
    return this.resetPasswordForm.controls;
  }

  ngOnInit(): void {
    this.resetPasswordForm = this.fb.group({
      password: [null, Validators.required],
    });
  }

  submit(): void {
    this.hasError = false;
    if (this.resetPasswordForm.valid) {
      this.authService
        .resetPassword({
          ...this.resetPasswordForm.value,
          userName: this.userName,
        })
        .subscribe({
          next: (response: any) => {
            if (response.header.result) {
              this.router.navigate(['/auth/login']);
            } else {
              this.hasError = true;
            }
          },
          error: () => {
            this.hasError = true;
          },
        });
    } else {
      this.hasError = true;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((s) => s.unsubscribe());
  }
}