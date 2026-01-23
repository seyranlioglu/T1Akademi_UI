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
  verifyForm!: FormGroup; // Login sonrası 2FA için
  
  isLoading$ = this.authService.isLoading$;
  showPassword = false;

  // Login 2FA değişkenleri
  isVerificationStep = false; 
  pendingUserName = '';       
  
  remainingTime = 120; 
  timerSub: Subscription | null = null;

  // Modallar
  isForgotPasswordModalOpen = false;
  isAccountConfirmModalOpen = false;
  unverifiedEmail = ''; // Hesabı doğrulanmamış kişinin maili

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

    this.checkRememberedUser();
  }

  get f() { return this.loginForm.controls; }

  checkRememberedUser() {
    const savedUser = localStorage.getItem('rememberedUser');
    if (savedUser) {
        this.loginForm.patchValue({ emailOrPhone: savedUser, rememberMe: true });
    }
  }

  // --- LOGIN İŞLEMİ ---
  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    let inputVal = this.loginForm.get('emailOrPhone')?.value;
    let submissionType = 1; // 1: Sms, 0: Email
    
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
        
        // 1. BAŞARILI GİRİŞ (Result: true)
        if (res.header.result) {
            this.toastr.success(res.header.msg || "Doğrulama kodu gönderildi.");
            this.pendingUserName = inputVal; 
            this.isVerificationStep = true;  
            this.startTimer();               
        } 
        // 2. DOĞRULANMAMIŞ HESAP (ResCode: 119)
        else if (res.header.resCode == 119) {
            this.unverifiedEmail = inputVal.includes('@') ? inputVal : '';
            this.openAccountConfirmModal();
        }
        else {
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

  // --- LOGIN 2FA VERIFY ---
  onVerifySubmit() {
    if (this.verifyForm.invalid) return;
    const code = this.verifyForm.get('code')?.value;
    const rememberMeValue = this.loginForm.get('rememberMe')?.value || false;
    
    this.authService.isLoadingSubject.next(true);
    
    this.authService.verify(this.pendingUserName, code, rememberMeValue).subscribe({
      next: (res: any) => {
        this.authService.isLoadingSubject.next(false);
        if (res.header.result) {
          if (res.body) {
              // 1. LocalStorage'a kaydet
              localStorage.setItem('currentUser', JSON.stringify(res.body));
              
              // 2. AuthService'i güncelle (Uygulamanın geri kalanı haberdar olsun)
              this.authService.currentUserSubject.next(res.body);
          }
          if (rememberMeValue) localStorage.setItem('rememberedUser', this.loginForm.get('emailOrPhone')?.value);
          else localStorage.removeItem('rememberedUser');
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

  // --- MODAL YÖNETİMİ ---
  openAccountConfirmModal() {
    this.isAccountConfirmModalOpen = true;
  }

  closeAccountConfirmModal() {
    this.isAccountConfirmModalOpen = false;
  }

  onAccountConfirmComplete() {
    this.isAccountConfirmModalOpen = false;
    this.toastr.info("Hesabınız doğrulandı, lütfen tekrar giriş yapın.");
    this.loginForm.reset();
  }

  // --- YARDIMCI FONKSİYONLAR ---
  openForgotPasswordModal() { this.isForgotPasswordModalOpen = true; }
  closeForgotPasswordModal() { this.isForgotPasswordModalOpen = false; }
  onPasswordResetSuccess() {
    this.isForgotPasswordModalOpen = false;
    this.toastr.success('Şifreniz değiştirildi.');
  }

  resendCode() { this.onSubmit(); }

  onDynamicInput(event: any) {
    const input = event.target;
    let val = input.value;
    if (!val) return;
    const isDigit = /^\d$/.test(val.charAt(0)); 
    if (isDigit && !val.includes('@')) {
        let numbers = val.replace(/\D/g, '');
        if (numbers.startsWith('0')) { if (numbers.length > 1 && numbers[1] !== '5') { numbers = '0'; } } 
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
        if (this.remainingTime > 0) this.remainingTime--; 
        else this.timerSub?.unsubscribe();
    });
  }

  ngOnDestroy() {
    if (this.timerSub) this.timerSub.unsubscribe();
  }
}