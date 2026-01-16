import { Component, EventEmitter, Output } from '@angular/core';
import { UserApiService } from 'src/app/shared/api/user-api.service';

@Component({
  selector: 'app-forgot-password-page',
  templateUrl: './forgot-password-page.component.html',
  styleUrls: ['./forgot-password-page.component.scss']
})
export class ForgotPasswordPageComponent {

  @Output() close = new EventEmitter<void>(); 
  @Output() success = new EventEmitter<void>(); 

  currentStep: number = 1;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  formData = {
    emailOrPhone: '',
    code: '',
    password: '',
    confirmPassword: ''
  };

  constructor(private userApiService: UserApiService) { }

  resetWizard() {
    this.currentStep = 1;
    this.errorMessage = '';
    this.successMessage = '';
    this.formData = { emailOrPhone: '', code: '', password: '', confirmPassword: '' };
  }

  // --- LOGİN'DEN ALINAN AKILLI MASKELEME MANTIĞI ---
  onDynamicInput(event: any) {
    const input = event.target;
    const originalValue = input.value;
    if (!originalValue) return;

    const firstChar = originalValue.charAt(0);
    const isDigit = /^\d$/.test(firstChar); 

    // Eğer rakamla başlıyorsa (Telefon muamelesi yap)
    if (isDigit) {
        let numbers = originalValue.replace(/\D/g, '');
        
        // 0 ve 5 kontrolü (Akıllı tamamlama)
        if (numbers.startsWith('0')) { 
            if (numbers.length > 1 && numbers[1] !== '5') { numbers = '0'; } 
        } 
        else if (numbers.startsWith('5')) { numbers = '0' + numbers; } 
        else { numbers = '05' + numbers; }

        if (numbers.length > 11) { numbers = numbers.substring(0, 11); }

        // Formatlama: 05XX XXX XX XX
        let formatted = "";
        if (numbers.length > 0) formatted = numbers.substring(0, 4);
        if (numbers.length > 4) formatted += " " + numbers.substring(4, 7);
        if (numbers.length > 7) formatted += " " + numbers.substring(7, 9);
        if (numbers.length > 9) formatted += " " + numbers.substring(9, 11);

        // Hem input'a hem modele yaz
        input.value = formatted;
        this.formData.emailOrPhone = formatted;
    } else {
        // Rakam değilse olduğu gibi bırak (E-posta olabilir)
        this.formData.emailOrPhone = originalValue;
    }
  }

  // 1. ADIM: Doğrulama Kodu Gönder (Backend DTO'ya Uygun)
  sendCode() {
    if (!this.formData.emailOrPhone) {
      this.errorMessage = 'Lütfen e-posta veya telefon giriniz.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // -- TİP BELİRLEME MANTIĞI --
    let inputVal = this.formData.emailOrPhone;
    let submissionType = 1; // Varsayılan: Telefon (SubmissionTypeEnum.Phone)
    
    if (inputVal.includes('@')) {
        submissionType = 0; // E-posta (SubmissionTypeEnum.Email)
    } else {
        // Telefon ise boşlukları temizle (0555 444 33 22 -> 05554443322)
        if (inputVal) inputVal = inputVal.replace(/\s/g, ''); 
    }

    // Backend'in beklediği DTO yapısı: ForgotPasswordDto
    const requestPayload = {
        userName: inputVal,
        type: submissionType
    };

    this.userApiService.forgotPassword(requestPayload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        // Backend başarılı yanıt döndüyse 2. adıma geç
        if (res?.header?.result) {
             this.currentStep = 2;
             this.successMessage = 'Doğrulama kodu gönderildi.';
        } else {
             this.errorMessage = res?.header?.msg || 'İşlem başarısız.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.header?.msg || 'Kullanıcı bulunamadı veya hata oluştu.';
      }
    });
  }

  // 2. ADIM: Kodu Doğrula
  verifyCode() {
    if (!this.formData.code || this.formData.code.length < 4) {
      this.errorMessage = 'Lütfen geçerli bir kod giriniz.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Mail mi telefon mu tekrar kontrol edip temizleyelim
    let cleanUserName = this.formData.emailOrPhone;
    if (!cleanUserName.includes('@')) {
        cleanUserName = cleanUserName.replace(/\s/g, '');
    }

    const payload = {
      userName: cleanUserName, // Not: Backend metoduna göre burası 'userName' de olabilir, kontrol et.
      code: this.formData.code
    };

    this.userApiService.verifyForgotPassword(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if(res?.header?.result) {
            this.currentStep = 3; 
            this.successMessage = 'Kod doğrulandı.';
        } else {
            this.errorMessage = res?.header?.msg || 'Kod hatalı.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.header?.msg || 'Girdiğiniz kod hatalı.';
      }
    });
  }

  // 3. ADIM: Yeni Şifre
  resetPassword() {
    if (this.formData.password !== this.formData.confirmPassword) {
      this.errorMessage = 'Şifreler eşleşmiyor.';
      return;
    }
    if (!this.formData.password) {
        this.errorMessage = 'Lütfen yeni şifre giriniz.';
        return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    let cleanUserName = this.formData.emailOrPhone;
    if (!cleanUserName.includes('@')) {
        cleanUserName = cleanUserName.replace(/\s/g, '');
    }

    const payload = {
      userName: cleanUserName,
      password: this.formData.password
    };

    this.userApiService.resetPassword(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if(res?.header?.result) {
            this.success.emit(); // Login sayfasına "bitti" de.
        } else {
            this.errorMessage = res?.header?.msg || 'Şifre değiştirilemedi.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.header?.msg || 'Şifre değiştirilemedi.';
      }
    });
  }

  onCancel() {
    this.close.emit();
  }
}