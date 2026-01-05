import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription, Observable, first, catchError } from 'rxjs';
import { UserApiService } from 'src/app/shared/api/user-api.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { TimerService } from 'src/app/shared/services/timer.service';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss']
})
export class RegisterPageComponent {
  private subscribe: Subscription[] = [];

  registerForm!: FormGroup;
  verificationMethod: any = 1;
  currAccTypeList: any[] = [];
  isLoading$: Observable<boolean>;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private router: Router,
    private userService: UserApiService,
    private timerService: TimerService,
    private toastr: ToastrService
  ) {
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
    this.buildForm();
    this.isLoading$ = this.authService.isLoading$;
  }

  ngOnInit() {
    const apiSubs = this.userService.getCurrAccTypeList().subscribe((response: any) => {
      if (response?.header?.result) {
        this.currAccTypeList = response.body;
      }

    });
    this.subscribe.push(apiSubs);
  }

  buildForm() {
    this.registerForm = this.fb.group({
      email: [null, Validators.required],
      phoneNumber: [null, Validators.required],
      name: [null, Validators.required],
      surname: [null, Validators.required],
      title: [null, Validators.required],
      address: [null, Validators.required],
      taxNumber: [null, Validators.required],
      identityNumber: [null, Validators.required],
      postalCode: [null, Validators.required],
      currAccTypeId: [null, Validators.required]
    });
  }

  submit() {
    if (this.registerForm.valid) {
      const apiSubs = this.authService
        .register({ ...this.registerForm.value })
        .pipe(first(), catchError(() => {
          this.authService.isLoadingSubject.next(false);
          return [];
        }))
        .subscribe((response: any) => {
          if (response.header.result) {
            const apiSubs = this.authService.verifyCodeSend({ receiver: this.registerForm.value.email, type: 0 }).subscribe((res: any) => {
              if (res?.header?.result) {
                this.authService.isLoadingSubject.next(false);
                this.timerService.startCountdown(120);

                this.router.navigate(['auth/verify'], {
                  state: { userName: this.registerForm.value.email, isRegister: true, phoneNumber: this.registerForm.value.phoneNumber },
                });
              }
            });
            this.subscribe.push(apiSubs);
          } else {
            this.authService.isLoadingSubject.next(false);
            this.toastr.error(response.header.msg);
          }
        });
      this.subscribe.push(apiSubs);
    }
  }

  ngOnDestroy(): void {
    this.subscribe.forEach((s) => s.unsubscribe());
  }
}
