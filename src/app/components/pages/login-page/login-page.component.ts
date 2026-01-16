import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/shared/services/auth.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit, OnDestroy {
  
  loginForm!: FormGroup;
  verifyForm!: FormGroup;
  
  isLoading$ = this.authService.isLoading$;
  showPassword = false;

  isVerificationStep = false; 
  pendingUserName = '';       
  
  remainingTime = 120; 
  timerSub: Subscription | null = null;

  isForgotPasswordModalOpen = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      emailOrPhone: [null, [Validators.required]],
      password: [null, [Validators.required]],
      rememberMe: [false] 
    });

    this.verifyForm = this.fb.group({
      code: [null, [Validators.required, Validators.minLength(4)]]
    });

    // --- YENİ EKLENEN: Kayıtlı kullanıcıyı kontrol et ---
    this.checkRememberedUser();
  }

  get f() { return this.loginForm.controls; }

  // --- YENİ EKLENEN: Hafızadaki kullanıcıyı yükle ---
  checkRememberedUser() {
    const savedUser = localStorage.getItem('rememberedUser');
    if (savedUser) {
        this.loginForm.patchValue({
            emailOrPhone: savedUser,
            rememberMe: true
        });
    }
  }

  openForgotPasswordModal() {
    this.isForgotPasswordModalOpen = true;
  }

  closeForgotPasswordModal() {
    this.isForgotPasswordModalOpen = false;
  }

  onPasswordResetSuccess() {
    this.isForgotPasswordModalOpen = false;
    this.toastr.success('Şifreniz başarıyla değiştirildi. Yeni şifrenizle giriş yapabilirsiniz.');
  }

  onDynamicInput(event: any) {
    const input = event.target;
    const originalValue = input.value;
    if (!originalValue) return;

    const firstChar = originalValue.charAt(0);
    const isDigit = /^\d$/.test(firstChar); 

    if (isDigit) {
        let numbers = originalValue.replace(/\D/g, '');
        if (numbers.startsWith('0')) { 
            if (numbers.length > 1 && numbers[1] !== '5') { numbers = '0'; } 
        } 
        else if (numbers.startsWith('5')) { numbers = '0' + numbers; } 
        else { numbers = '05' + numbers; }

        if (numbers.length > 11) { numbers = numbers.substring(0, 11); }

        let formatted = "";
        if (numbers.length > 0) formatted = numbers.substring(0, 4);
        if (numbers.length > 4) formatted += " " + numbers.substring(4, 7);
        if (numbers.length > 7) formatted += " " + numbers.substring(7, 9);
        if (numbers.length > 9) formatted += " " + numbers.substring(9, 11);

        input.value = formatted;
        this.loginForm.get('emailOrPhone')?.setValue(formatted, { emitEvent: false });
    }
  }

  numberOnly(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) return false;
    return true;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    let inputVal = this.loginForm.get('emailOrPhone')?.value;
    let submissionType = 1; 
    
    if (inputVal.includes('@')) {
        submissionType = 0; 
    } else {
        if (inputVal) inputVal = inputVal.replace(/\s/g, ''); 
    }

    const loginData = {
      userName: inputVal,
      password: this.loginForm.get('password')?.value,
      type: submissionType
    };

    this.authService.isLoadingSubject.next(true);

    this.authService.login(loginData).subscribe({
      next: (res: any) => {
        this.authService.isLoadingSubject.next(false);
        
        if (res.header.result) {
            this.toastr.success(res.header.msg || "Doğrulama kodu gönderildi.");
            this.pendingUserName = inputVal; 
            this.isVerificationStep = true;  
            this.startTimer();               
        } else {
            const cleanMsg = this.parseErrorMessage(res.header.msg);
            this.toastr.error(cleanMsg);
        }
      },
      error: (err) => {
        this.authService.isLoadingSubject.next(false);
        const errorMsg = err?.error?.header?.msg || "Giriş başarısız.";
        this.toastr.error(this.parseErrorMessage(errorMsg));
      }
    });
  }

  onVerifySubmit() {
    if (this.verifyForm.invalid) return;

    const code = this.verifyForm.get('code')?.value;
    const rememberMeValue = this.loginForm.get('rememberMe')?.value || false;
    
    this.authService.isLoadingSubject.next(true);

    this.authService.verify(this.pendingUserName, code, rememberMeValue).subscribe({
        next: (res: any) => {
            this.authService.isLoadingSubject.next(false);
            
            if (res.header.result) {
                
                // --- YENİ EKLENEN: Beni Hatırla Logic ---
                if (rememberMeValue) {
                    // Kullanıcı adını ham haliyle kaydedelim (maskelenmiş halini de kaydedebilirsin)
                    localStorage.setItem('rememberedUser', this.loginForm.get('emailOrPhone')?.value);
                } else {
                    localStorage.removeItem('rememberedUser');
                }
                // ----------------------------------------

                this.toastr.success("Giriş Başarılı!");
                this.router.navigate(['/']);
            } else {
                this.toastr.error("Kod hatalı veya süresi dolmuş.");
            }
        },
        error: (err) => {
            this.authService.isLoadingSubject.next(false);
            this.toastr.error("Doğrulama başarısız.");
        }
    });
  }

  resendCode() {
      this.onSubmit();
  }

  private parseErrorMessage(msg: any): string {
    if (!msg) return "Hata oluştu";
    if (typeof msg === 'string' && (msg.trim().startsWith('{') || msg.trim().startsWith('['))) {
        try {
            const parsed = JSON.parse(msg);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed[0].Message || parsed[0].msg || "Hata";
            return parsed.Message || parsed.msg || "Hata";
        } catch (e) { return msg; }
    }
    return msg;
  }

  startTimer() {
    this.remainingTime = 120; 
    if (this.timerSub) this.timerSub.unsubscribe();
    
    this.timerSub = interval(1000).subscribe(() => {
        if (this.remainingTime > 0) {
            this.remainingTime--;
        } else {
            this.timerSub?.unsubscribe();
        }
    });
  }

  ngOnDestroy() {
    if (this.timerSub) this.timerSub.unsubscribe();
  }
}