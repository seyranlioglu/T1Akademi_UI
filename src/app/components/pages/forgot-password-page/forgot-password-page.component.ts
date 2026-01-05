import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { first, Observable, Subscription } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { TimerService } from 'src/app/shared/services/timer.service';

@Component({
  selector: 'app-forgot-password-page',
  templateUrl: './forgot-password-page.component.html',
  styleUrls: ['./forgot-password-page.component.scss']
})
export class ForgotPasswordPageComponent {

  private subscribe: Subscription[] = [];

  forgotPasswordForm!: FormGroup;
  isLoading$: Observable<boolean>;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private router: Router,
    private timerService: TimerService
  ) {
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }

    this.buildForm();
    this.isLoading$ = this.authService.isLoading$;
  }

  buildForm() {
    this.forgotPasswordForm = this.fb.group({
      userName: [null, Validators.required],
      type: [0, Validators.required],
    });
  }

  submit() {
    if (this.forgotPasswordForm.valid) {
      this.authService
        .forgotPassword({ ...this.forgotPasswordForm.value })
        .pipe(first())
        .subscribe((response: any) => {
          if (response.header.result) {
            this.timerService.startCountdown(120);
            this.router.navigate(['auth/verify'], {
              state: { userName: this.forgotPasswordForm.value.userName, isForgotPassword: true },
            });
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.subscribe.forEach((s) => s.unsubscribe());
  }
}
