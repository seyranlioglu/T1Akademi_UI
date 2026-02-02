import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { InstructorApiService } from 'src/app/shared/api/instructor-api.service';
import { DialogService } from 'primeng/dynamicdialog'; 
// import { PhoneVerificationModalComponent } from '...'; // İleride eklenecek

@Component({
  selector: 'app-instructor-profile-page',
  templateUrl: './instructor-profile-page.component.html',
  styleUrls: ['./instructor-profile-page.component.scss'],
  providers: [DialogService]
})
export class InstructorProfilePageComponent implements OnInit {

  profileForm: FormGroup;
  isLoading = false;
  isSaving = false;
  
  // Resim Seçici Kontrolü
  showImageSelector = false;
  
  // Profil Verisi (API'den gelen ham data)
  currentProfile: any = null;
  defaultImage = 'assets/img/user/default-user.png'; // assets yolunu düzelttim

  constructor(
    private fb: FormBuilder,
    private instructorApi: InstructorApiService,
    private toastr: ToastrService,
    private dialogService: DialogService
  ) {
    this.profileForm = this.fb.group({
      id: [0],
      
      // Read-Only Alanlar (User tablosundan gelir)
      firstName: [{ value: '', disabled: true }],
      lastName: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],
      phone: [{ value: '', disabled: true }],

      // Editable Alanlar (Instructor tablosuna gider)
      title: ['', [Validators.required, Validators.maxLength(150)]],
      bio: ['', [Validators.required, Validators.minLength(50)]],
      linkedin: [''],
      twitter: [''],
      website: [''],
      profileImage: [''] 
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

loadProfile() {
    this.isLoading = true;
    this.instructorApi.getMyProfile().subscribe({
      next: (res) => {
        // 🔥 DÜZELTME BURADA:
        // Gelen veri "body" içindeyse onu al, yoksa "data"ya bak, o da yoksa direkt response'u al.
        const data = res.body || res.data || res;
        
        this.currentProfile = data;
        
        // Formu doldur
        this.profileForm.patchValue({
            id: data.id,
            firstName: data.firstName, // Artık body.firstName'i okuyacak
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            
            title: data.title,
            bio: data.bio,
            linkedin: data.linkedin,
            twitter: data.twitter,
            website: data.website,
            profileImage: data.profileImage
        });
        
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Profil bilgileri alınamadı.');
        this.isLoading = false;
      }
    });
  }
  // --- RESİM SEÇME İŞLEMLERİ ---
  openImageSelector() {
    this.showImageSelector = true;
  }

  onImageSelected(path: string) {
    this.profileForm.patchValue({ profileImage: path });
    // Anlık güncelleme için:
    if(this.currentProfile) this.currentProfile.profileImage = path;
    this.showImageSelector = false;
  }

  onImageSelectionCancel() {
    this.showImageSelector = false;
  }

  // --- TELEFON GÜNCELLEME (MODAL) ---
  openPhoneVerification() {
      // Buraya modal açma kodu gelecek. Şimdilik toast.
      this.toastr.info('Telefon güncelleme modülü yapım aşamasında.');
      
      /*
      const ref = this.dialogService.open(PhoneVerificationModalComponent, {
          header: 'Telefon Numarası Güncelle',
          width: '400px'
      });
      */
  }

  // --- KAYDETME ---
  onSubmit() {
    if (this.profileForm.invalid) {
        this.toastr.warning('Lütfen gerekli alanları doldurunuz.');
        return;
    }

    this.isSaving = true;
    
    // Formdan değerleri alıp Backend'in beklediği DTO formatına getiriyoruz
    const formData = {
        id: this.currentProfile.id,
        title: this.profileForm.get('title')?.value,
        bio: this.profileForm.get('bio')?.value,
        linkedin: this.profileForm.get('linkedin')?.value,
        twitter: this.profileForm.get('twitter')?.value,
        website: this.profileForm.get('website')?.value,
        
        // 🔥 EKLENDİ: Profil Fotoğrafı Yolu
        // Form control'ünden değeri alıyoruz (ContentLibrarySelector burayı doldurmuştu)
        profileImage: this.profileForm.get('profileImage')?.value 
    };

    this.instructorApi.updateProfile(formData).subscribe({
      next: (res) => {
        this.toastr.success('Profiliniz başarıyla güncellendi.');
        this.isSaving = false;
        // Güncel halini tekrar çekelim
        this.loadProfile(); 
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Güncelleme başarısız.');
        this.isSaving = false;
      }
    });
  }
}