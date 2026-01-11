import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription, Observable, first, catchError, interval, takeWhile } from 'rxjs';
import { UserApiService } from 'src/app/shared/api/user-api.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { TimerService } from 'src/app/shared/services/timer.service';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss']
})
export class RegisterPageComponent implements OnInit, OnDestroy {
  private subscribe: Subscription[] = [];

  // Adımlar: 1=Kişisel, 2=Kurumsal, 3=Email Doğrulama, 4=SMS Doğrulama
  currentStep = 1;
  
  registerForm!: FormGroup;
  verifyForm!: FormGroup;

  // Kurumsal Tip ID (Sabit)
  corporateTypeId: number = 2; 

  isLoading$: Observable<boolean>;
  
  // Kayıt sonrası veriler
  registeredEmail: string = '';
  registeredUserId: number = 0;
  
  // EKSİK OLAN DEĞİŞKEN BURASIYDI:
  registeredPhoneNumber: string = ''; 

  // Sayaç ve Görünüm
  remainingTime: number = 120;
  isTimerRunning = false;
  showPassword = false;
  showConfirmPassword = false;

  passwordCriteria = {
    length: false,
    upperCase: false,
    number: false,
    specialChar: false,
    noSequential: false,
    match: false
  };

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private router: Router,
    private userService: UserApiService,
    public timerService: TimerService,
    private toastr: ToastrService
  ) {
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
    this.isLoading$ = this.authService.isLoading$;
  }

  ngOnInit() {
    this.buildForm();
    this.registerForm.get('currAccTypeId')?.setValue(this.corporateTypeId);
  }

  get f() { return this.registerForm.controls; }

  buildForm() {
    this.registerForm = this.fb.group({
      name: [null, Validators.required],
      surname: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      phoneNumber: [null, [Validators.required, Validators.pattern(/^05\d{2}\s\d{3}\s\d{2}\s\d{2}$/)]],
      password: [null, [Validators.required, Validators.minLength(8)]],
      passwordConfirm: [null, Validators.required],
      title: [null, Validators.required],
      taxNumber: [null, Validators.required],
      address: [null, Validators.required],
      postalCode: [null, Validators.required],
      identityNumber: [null],
      currAccTypeId: [this.corporateTypeId, Validators.required] 
    });

    this.verifyForm = this.fb.group({
      code: [null, [Validators.required, Validators.minLength(4)]]
    });
  }

  // --- ŞİFRE KONTROLLERİ ---
  checkPasswordRules() {
    const pass = this.registerForm.get('password')?.value || '';
    const confirmPass = this.registerForm.get('passwordConfirm')?.value || '';

    this.passwordCriteria.length = pass.length >= 8;
    this.passwordCriteria.upperCase = /[A-Z]/.test(pass);
    this.passwordCriteria.number = /[0-9]/.test(pass);
    this.passwordCriteria.specialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass);
    this.passwordCriteria.noSequential = !this.hasSequential(pass);
    this.passwordCriteria.match = (pass === confirmPass) && pass.length > 0;
  }

  hasSequential(s: string): boolean {
    if (s.length < 3) return false;
    for (let i = 0; i < s.length - 2; i++) {
        const charCode1 = s.charCodeAt(i);
        const charCode2 = s.charCodeAt(i + 1);
        const charCode3 = s.charCodeAt(i + 2);
        if (charCode1 + 1 === charCode2 && charCode2 + 1 === charCode3) return true;
    }
    return false;
  }

  // --- NAVİGASYON ---
  goToStep2() {
    const step1Controls = ['name', 'surname', 'email', 'phoneNumber', 'password', 'passwordConfirm'];
    let valid = true;
    
    this.checkPasswordRules();
    const allRulesPassed = Object.values(this.passwordCriteria).every(v => v === true);

    if (!allRulesPassed) {
        this.toastr.warning("Lütfen şifre kurallarının tamamını sağlayınız.");
        this.registerForm.get('password')?.markAsTouched();
        this.registerForm.get('passwordConfirm')?.markAsTouched();
        return;
    }

    step1Controls.forEach(key => {
        const control = this.registerForm.get(key);
        if (control?.invalid) {
            control.markAsTouched();
            valid = false;
        }
    });

    if (valid) {
        this.currentStep = 2;
    } else {
        this.toastr.warning("Lütfen kişisel bilgileri eksiksiz doldurunuz.");
    }
  }

  goBackToStep1() {
    this.currentStep = 1;
  }

  // --- KAYIT İŞLEMİ ---
  submitRegister() {
    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid) {
      this.toastr.warning("Lütfen tüm zorunlu alanları doldurunuz.");
      return;
    }

    const requestData = { ...this.registerForm.value };

    // Telefonu temizle
    if (requestData.phoneNumber) {
        requestData.phoneNumber = requestData.phoneNumber.replace(/\s/g, '');
    }
    delete requestData.passwordConfirm;

    // ID göndermiyoruz, Backend DTO'da "K" varsayılan.

    this.authService.isLoadingSubject.next(true);

    const apiSubs = this.authService
      .register(requestData)
      .pipe(first(), catchError((err) => {
        this.authService.isLoadingSubject.next(false);
        this.toastr.error(err?.error?.header?.msg || "Kayıt sırasında hata oluştu.");
        return [];
      }))
      .subscribe((response: any) => {
        if (response.header.result) {
          this.registeredUserId = response.body.id;
          this.registeredEmail = requestData.email;
          // EKSİK OLAN ATAMA BURADAYDI:
          this.registeredPhoneNumber = requestData.phoneNumber; 
          
          // İlk Doğrulama: Email (0)
          this.sendVerifyCode(0); 
        } else {
          this.authService.isLoadingSubject.next(false);
          this.toastr.error(response.header.msg);
        }
      });
    this.subscribe.push(apiSubs);
  }

  // --- KOD GÖNDERME ---
  sendVerifyCode(type: number) {
    // Type 0: Email, Type 1: SMS
    const receiver = type === 0 ? this.registeredEmail : this.registeredPhoneNumber;

    const apiSubs = this.authService.verifyCodeSend({ receiver: receiver, type: type })
      .subscribe((res: any) => {
        if (res?.header?.result) {
          this.authService.isLoadingSubject.next(false);
          
          if (type === 0) {
              this.toastr.success("Doğrulama kodu e-posta adresinize gönderildi.");
              this.currentStep = 3; 
          } else {
              this.toastr.success("Doğrulama kodu telefonunuza (SMS) gönderildi.");
              this.currentStep = 4;
          }
          
          this.verifyForm.reset(); 
          this.startLocalTimer();
        } else {
            this.authService.isLoadingSubject.next(false);
            this.toastr.error("Kod gönderilemedi.");
        }
      });
    this.subscribe.push(apiSubs);
  }

  // --- KOD DOĞRULAMA ---
  submitVerify() {
    if(this.verifyForm.invalid) return;
    this.authService.isLoadingSubject.next(true);

    // ADIM 3: EMAIL
    if (this.currentStep === 3) {
        const verifyData = {
            UserName: this.registeredEmail,
            CodeParameter: this.registeredEmail,
            Code: this.verifyForm.get('code')?.value,
            SubmissionType: 0 // Email
        };

        this.userService.verifyConfirm(verifyData).subscribe({
            next: (res: any) => {
                if(res.result || res.header?.result) {
                    this.toastr.success("E-Posta doğrulandı! Şimdi SMS doğrulaması yapılıyor...");
                    // SMS Gönder (Type: 1)
                    this.sendVerifyCode(1);
                } else {
                    this.authService.isLoadingSubject.next(false);
                    this.toastr.error(res.message || "E-Posta kodu hatalı.");
                }
            },
            error: (err) => {
                this.authService.isLoadingSubject.next(false);
                this.toastr.error("Doğrulama hatası.");
            }
        });
    }
    // ADIM 4: SMS
    else if (this.currentStep === 4) {
        const verifyData = {
            UserName: this.registeredEmail, // Kullanıcıyı bulmak için yine Email
            CodeParameter: this.registeredPhoneNumber, // Parametre Telefon
            Code: this.verifyForm.get('code')?.value,
            SubmissionType: 1 // SMS
        };

        this.userService.verifyConfirm(verifyData).subscribe({
            next: (res: any) => {
                this.authService.isLoadingSubject.next(false);
                if(res.result || res.header?.result) {
                    this.toastr.success("Telefon da doğrulandı! Kayıt tamamlandı.");
                    setTimeout(() => {
                      this.router.navigate(['/auth/login']);
                    }, 1500);
                } else {
                    this.toastr.error(res.message || "SMS kodu hatalı.");
                }
            },
            error: (err) => {
                this.authService.isLoadingSubject.next(false);
                this.toastr.error("Doğrulama hatası.");
            }
        });
    }
  }

  // --- EKSİK OLAN METOD BURASIYDI ---
  resendCurrentCode() {
      // Adım 3 ise Email (0), Adım 4 ise SMS (1) tekrar gönder
      const type = this.currentStep === 3 ? 0 : 1;
      this.sendVerifyCode(type);
  }

  // --- HELPER METODLAR ---
  onPhoneInput(event: any) { 
    let input = event.target;
    let value = input.value.replace(/\D/g, ''); 
    if (value.length === 0) { input.value = ""; this.registerForm.get('phoneNumber')?.setValue(""); return; }
    if (value.startsWith('0')) { if (value.length > 1 && value[1] !== '5') { value = '0'; } } 
    else if (value.startsWith('5')) { value = '0' + value; } 
    else { value = '05' + value; }
    if (value.length > 11) { value = value.substring(0, 11); }
    let formatted = "";
    if (value.length > 0) formatted = value.substring(0, 4);
    if (value.length > 4) formatted += " " + value.substring(4, 7);
    if (value.length > 7) formatted += " " + value.substring(7, 9);
    if (value.length > 9) formatted += " " + value.substring(9, 11);
    input.value = formatted;
    this.registerForm.get('phoneNumber')?.setValue(formatted, { emitEvent: false });
  }

  numberOnly(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) return false;
    return true;
  }
  
  startLocalTimer() {
    this.remainingTime = 120;
    this.isTimerRunning = true;
    interval(1000).pipe(takeWhile(() => this.isTimerRunning && this.remainingTime > 0)).subscribe(() => { this.remainingTime--; });
  }

  ngOnDestroy(): void {
    this.isTimerRunning = false;
    this.subscribe.forEach((s) => s.unsubscribe());
  }
}