import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { InstructorApiService } from 'src/app/shared/api/instructor-api.service'; // Yeni servis
import { UserApiService } from 'src/app/shared/api/user-api.service';

@Component({
  selector: 'app-instructor-profile-page',
  templateUrl: './instructor-profile-page.component.html',
  styleUrls: ['./instructor-profile-page.component.scss']
})
export class InstructorProfilePageComponent implements OnInit {

  profileForm: FormGroup;
  isLoading = false;
  isSaving = false;
  
  // Resim Seçici Kontrolü
  showImageSelector = false;
  
  // Profil Verisi
  currentProfile: any = null;
  defaultImage = 'assets/images/defaults/defaultuser.png';

  constructor(
    private fb: FormBuilder,
    private instructorApi: InstructorApiService, // Backend'de yazdığımız Controller'a bağlanır
    private toastr: ToastrService
  ) {
    this.profileForm = this.fb.group({
      id: [0],
      title: ['', [Validators.required, Validators.maxLength(150)]],
      bio: ['', [Validators.required, Validators.minLength(50)]],
      linkedin: [''],
      twitter: [''],
      website: [''],
      // Görseli form içinde tutuyoruz ama path olarak
      profileImage: [''] 
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading = true;
    this.instructorApi.getCurrentInstructorProfile().subscribe({
      next: (res) => {
        const data = res.data || res;
        this.currentProfile = data;
        
        // Formu doldur (Backend'den gelen DTO ile eşleşmeli)
        this.profileForm.patchValue({
            id: data.id,
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
        this.isLoading = false;
        // Eğer profil yoksa (ilk kez giriyorsa) hata vermeyebiliriz, form boş kalır.
      }
    });
  }

  // --- RESİM SEÇME İŞLEMLERİ ---
  openImageSelector() {
    this.showImageSelector = true;
  }

  onImageSelected(path: string) {
    // Selector'dan gelen dosya yolu
    this.profileForm.patchValue({ profileImage: path });
    this.showImageSelector = false;
  }

  onImageSelectionCancel() {
    this.showImageSelector = false;
  }

  // --- KAYDETME ---
  onSubmit() {
    if (this.profileForm.invalid) {
        this.toastr.warning('Lütfen gerekli alanları doldurunuz.');
        return;
    }

    this.isSaving = true;
    const formData = this.profileForm.value;

    // Backend'de UpdateInstructorProfileAsync metoduna gider
    this.instructorApi.updateInstructorProfile(formData).subscribe({
      next: (res) => {
        this.toastr.success('Profiliniz başarıyla güncellendi.');
        this.isSaving = false;
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Güncelleme başarısız.');
        this.isSaving = false;
      }
    });
  }
}