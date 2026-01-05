import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { first, Observable, Subscription } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { TimerService } from 'src/app/shared/services/timer.service';

@Component({
    selector: 'app-verify',
    templateUrl: './verify.component.html',
    styleUrls: ['./verify.component.scss'],
})
export class VerifyComponent implements OnInit {
    private unsubscribe: Subscription[] = [];
    isLoading$: Observable<boolean>;
    userName: string;
    verificationForm!: FormGroup;
    timeLeft!: string;
    hasError!: boolean;
    returnUrl!: string;
    codeParameter!: string;
    phoneNumber!: string;
    isVerifyForgotPassword: boolean = false;
    isRegister: boolean = false;
    isEmailVerifyMessageVisible: boolean = false;
    isPhoneVerifyMessageVisible: boolean = false;
    isTimerOverriden: boolean = false;
    isVerifyPhoneStep: boolean = false;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        public authService: AuthService,
        private fb: FormBuilder,
        private timerService: TimerService,
        private toastr: ToastrService
    ) {
        if (this.authService.currentUserValue && !this.router.getCurrentNavigation()?.extras?.state?.['userName']) {
            this.router.navigate(['/']);
        }

        this.isLoading$ = this.authService.isLoading$;
        this.userName =
            this.router.getCurrentNavigation()?.extras?.state?.['userName'];
        this.isVerifyForgotPassword =
            this.router.getCurrentNavigation()?.extras?.state?.['isForgotPassword'];
        this.isRegister =
            this.router.getCurrentNavigation()?.extras?.state?.['isRegister'];
        this.codeParameter =
            this.router.getCurrentNavigation()?.extras?.state?.['codeParameter'];
        this.phoneNumber =
            this.router.getCurrentNavigation()?.extras?.state?.['phoneNumber'];

        if (this.isRegister) {
            this.isEmailVerifyMessageVisible = true;
        }
    }

    get f() {
        return this.verificationForm.controls;
    }

    ngOnInit(): void {
        this.verificationForm = this.fb.group({
            code: [null, Validators.required],
        });
        this.returnUrl =
            this.activatedRoute.snapshot.queryParams['returnUrl'.toString()] ||
            '/';
        this.timerService.remainingTime$.subscribe((value) => {
            const minutes = Math.floor(value / 60);
            const seconds = value % 60;
            this.timeLeft = `${String(minutes).padStart(2, '0')}:${String(
                seconds
            ).padStart(2, '0')}`;

            if (!value && !this.isTimerOverriden) {
                this.router.navigate(['/auth/login']);
            }
        });
    }

    submit(): void {
        this.hasError = false;

        if (this.isVerifyForgotPassword) {
            const verifySubs = this.authService
                .verifyForgotPassword(this.userName, this.f['code'].value)
                .pipe(first())
                .subscribe((response: any) => {
                    if (response?.header.result) {
                        this.router.navigate(['/auth/reset-password'], {
                            state: { userName: this.userName },
                        });
                    } else {
                        this.hasError = true;
                        this.verificationForm.reset();
                    }
                });
            this.unsubscribe.push(verifySubs);
        } else if (this.isRegister) {
            this.verifyEmail();
        } else if (this.isVerifyPhoneStep) {
            this.verifyPhoneNumber();
        } else {
            const verifySubs = this.authService
                .verify(this.userName, this.f['code'].value)
                .pipe(first())
                .subscribe((response: any) => {
                    if (response?.header.result) {
                        this.router.navigate([this.returnUrl]);
                    } else {
                        this.hasError = true;
                        this.verificationForm.reset();
                    }
                });
            this.unsubscribe.push(verifySubs);
        }
    }

    verifyEmail(): void {
        this.verifySentCode(this.userName, 0);
    }

    verifyPhoneNumber(): void {
        this.verifySentCode(this.phoneNumber, 1);
    }

    sendPhoneVerificationCode(): void {
        const apiSubs = this.authService.verifyCodeSend({ receiver: this.phoneNumber, type: 1 }).subscribe((res: any) => {
            if (res?.header?.result) {
                this.isVerifyPhoneStep = true;
                this.isRegister = false;
                this.timerService.startCountdown(120);
            }
        });
        this.unsubscribe.push(apiSubs);
    }

    verifySentCode(codeParameter: string, submissionType: number): void {
        this.isTimerOverriden = false;

        const verifySubs = this.authService
            .verifyConfirm({ userName: this.userName, codeParameter: codeParameter, submissionType: submissionType, code: this.f['code'].value })
            .pipe(first())
            .subscribe((response: any) => {
                if (response?.header.result) {
                    if (!submissionType) {
                        this.isEmailVerifyMessageVisible = false;
                        this.isPhoneVerifyMessageVisible = true;
                        this.verificationForm.reset();
                        this.isTimerOverriden = true;
                        this.timerService.stopCountdown();
                        this.sendPhoneVerificationCode();

                    } else {
                        this.toastr.success('Giriş bilgileriniz mail adresinize gönderildi.');
                        this.router.navigate(['/auth/login']);
                    }

                } else {
                    this.hasError = true;
                    this.verificationForm.reset();
                }
            });
        this.unsubscribe.push(verifySubs);
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach((s) => s.unsubscribe());
    }
}
