import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { first, Observable, Subscription } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { TimerService } from 'src/app/shared/services/timer.service';
@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent {
    private subscribe: Subscription[] = [];

    loginForm!: FormGroup;
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
        this.loginForm = this.fb.group({
            userName: [null, Validators.required],
            password: [null, Validators.required],
            type: [0, Validators.required],
        });
    }

    submit() {
        if (this.loginForm.valid) {
            this.authService
                .login({ ...this.loginForm.value })
                .pipe(first())
                .subscribe((response: any) => {
                    if (response.header.result) {
                        this.timerService.startCountdown(120);
                        this.router.navigate(['auth/verify'], {
                            state: { userName: this.loginForm.value.userName },
                        });
                    }
                });
        }
    }

    ngOnDestroy(): void {
        this.subscribe.forEach((s) => s.unsubscribe());
    }
}
