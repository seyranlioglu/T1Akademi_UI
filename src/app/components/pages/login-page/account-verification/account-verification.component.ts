import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/shared/services/auth.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-account-verification',
  templateUrl: './account-verification.component.html',
  styleUrls: ['./account-verification.component.scss']
})
export class AccountVerificationComponent implements OnInit, OnDestroy {

  @Input() startEmail: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() complete = new EventEmitter<void>();

  wizardForm!: FormGroup;
  // TypeScript hatasını önlemek için tipi netleştiriyoruz
  wizardStep: 'EMAIL_SEND' | 'EMAIL_VERIFY' | 'SMS_SEND' | 'SMS_VERIFY' | 'COMPLETE' = 'EMAIL_SEND';
  
  isLocalLoading = false;
  remainingTime = 120;
  timerSub: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.wizardForm = this.fb.group({
      email: [this.startEmail || '', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(10)]],
      code: ['', [Validators.required, Validators.minLength(4)]]
    });

    if (this.startEmail && this.startEmail.includes('@')) {
      this.wizardForm.get('email')?.disable();
    }
  }

  // --- ADIM 1: E-POSTA KOD GÖNDER ---
  sendEmailCode() {
    const emailControl = this.wizardForm.get('email');
    if (emailControl?.enabled && emailControl?.invalid) {
      this.toastr.warning("Lütfen geçerli bir E-Posta adresi giriniz.");
      return;
    }

    this.isLocalLoading = true;
    const email = emailControl?.value;

    this.authService.verifyCodeSend({ receiver: email, type: 0 }).subscribe({
      next: (res: any) => {
        this.isLocalLoading = false;
        // Backend yapına göre res.header.result veya direkt res.result olabilir
        const isSuccess = res.header ? res.header.result : res.result;
        
        if (isSuccess) {
          this.toastr.success("Doğrulama kodu gönderildi.");
          this.wizardStep = 'EMAIL_VERIFY';
          this.wizardForm.get('code')?.setValue('');
          this.startTimer();
        } else {
          this.toastr.error(res.header?.msg || "Kod gönderilemedi.");
        }
      },
      error: () => {
        this.isLocalLoading = false;
        this.toastr.error("Hata oluştu.");
      }
    });
  }

  // --- ADIM 2: E-POSTA DOĞRULA ---
  verifyEmail() {
    const email = this.wizardForm.get('email')?.value;
    const code = this.wizardForm.get('code')?.value;

    if (!code || code.length < 4) {
      this.toastr.warning("Lütfen kodu giriniz.");
      return;
    }

    this.isLocalLoading = true;
    const payload = { userName: email, code: code, submissionType: 0, codeParameter: email };

    this.authService.verifyConfirm(payload).subscribe({
      next: (res: any) => {
        this.isLocalLoading = false;
        const isSuccess = res.header ? res.header.result : res.result;

        if (isSuccess) {
          this.toastr.success("E-Posta doğrulandı!");
          this.wizardStep = 'SMS_SEND';
          this.stopTimer();
          this.wizardForm.get('code')?.setValue('');
        } else {
          this.toastr.error(res.header?.msg || "Kod hatalı.");
        }
      },
      error: () => {
        this.isLocalLoading = false;
        this.toastr.error("Doğrulama hatası.");
      }
    });
  }

  // --- ADIM 3: SMS KOD GÖNDER ---
  sendSmsCode() {
    const phone = this.wizardForm.get('phone')?.value;
    if (!phone) {
      this.toastr.warning("Telefon numarası giriniz.");
      return;
    }
    
    const cleanPhone = phone.replace(/\s/g, '');
    this.isLocalLoading = true;

    this.authService.verifyCodeSend({ receiver: cleanPhone, type: 1 }).subscribe({
      next: (res: any) => {
        this.isLocalLoading = false;
        const isSuccess = res.header ? res.header.result : res.result;

        if (isSuccess) {
          this.toastr.success("Kod gönderildi.");
          this.wizardStep = 'SMS_VERIFY';
          this.wizardForm.get('code')?.setValue('');
          this.startTimer();
        } else {
          this.toastr.error(res.header?.msg || "Kod gönderilemedi.");
        }
      },
      error: () => {
        this.isLocalLoading = false;
        this.toastr.error("Hata oluştu.");
      }
    });
  }

  // --- ADIM 4: SMS DOĞRULA ---
  verifySms() {
    const email = this.wizardForm.get('email')?.value;
    const phone = this.wizardForm.get('phone')?.value.replace(/\s/g, '');
    const code = this.wizardForm.get('code')?.value;

    if (!code) return;

    this.isLocalLoading = true;
    const payload = { userName: email, code: code, submissionType: 1, codeParameter: phone };

    this.authService.verifyConfirm(payload).subscribe({
      next: (res: any) => {
        this.isLocalLoading = false;
        const isSuccess = res.header ? res.header.result : res.result;

        if (isSuccess) {
          this.toastr.success("Telefon doğrulandı!");
          this.wizardStep = 'COMPLETE';
          this.stopTimer();
        } else {
          this.toastr.error(res.header?.msg || "Kod hatalı.");
        }
      },
      error: () => {
        this.isLocalLoading = false;
        this.toastr.error("Doğrulama hatası.");
      }
    });
  }

  finish() {
    this.complete.emit();
  }

  closeModal() {
    this.close.emit();
  }

  // --- FORMATLAMA ---
  onPhoneInput(event: any) {
    const input = event.target;
    let numbers = input.value.replace(/\D/g, '');
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
    this.wizardForm.get('phone')?.setValue(formatted, { emitEvent: false });
  }

  // --- TIMER ---
  startTimer() {
    this.remainingTime = 120;
    if (this.timerSub) this.timerSub.unsubscribe();
    this.timerSub = interval(1000).subscribe(() => {
      if (this.remainingTime > 0) this.remainingTime--;
      else this.timerSub?.unsubscribe();
    });
  }

  stopTimer() {
    if (this.timerSub) this.timerSub.unsubscribe();
    this.remainingTime = 0;
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }
}