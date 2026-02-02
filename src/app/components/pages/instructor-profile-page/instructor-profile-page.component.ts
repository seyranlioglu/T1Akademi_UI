import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { InstructorApiService } from 'src/app/shared/api/instructor-api.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Instructor } from 'src/app/shared/models/instructor.model';

@Component({
  selector: 'app-instructor-profile-page',
  templateUrl: './instructor-profile-page.component.html',
  styleUrls: ['./instructor-profile-page.component.scss']
})
export class InstructorProfilePageComponent implements OnInit {
  
  instructorId: string | null = null;
  instructorProfile: Instructor | null = null;
  isLoading: boolean = true;
  
  // Edit Mode & Form Değişkenleri
  isEditMode: boolean = false;
  isOwner: boolean = false; // Profil, giriş yapan kişiye mi ait?
  editForm: FormGroup;
  isSubmitting: boolean = false;

  // Modal Kontrolü
  showLibraryModal: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private instructorApi: InstructorApiService,
    private authService: AuthService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) { 
    // Form Kurulumu (Validasyonlarla birlikte)
    this.editForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      bio: ['', [Validators.required]],
      imageUrl: [''], // Buraya ContentLibrary'den seçilen URL gelecek
      socialMedia: this.fb.group({
        facebook: [''],
        twitter: [''],
        linkedin: [''],
        instagram: [''],
        website: ['']
      })
    });
  }

  ngOnInit(): void {
    // URL'den ID kontrolü: Hem /instructor-profile/123 hem de ?id=123 formatını destekler
    this.route.paramMap.subscribe(params => {
      const paramId = params.get('id');
      
      // Eğer parametre varsa, Public View (Vitrin) modunda çalış
      if (paramId) {
        this.instructorId = paramId;
        this.getInstructorDetails(this.instructorId);
      } else {
        // Parametre yoksa QueryParams'a bak, orada da yoksa Current User'ı çek
        this.route.queryParamMap.subscribe(qParams => {
            const queryId = qParams.get('id');
            if (queryId) {
                this.instructorId = queryId;
                this.getInstructorDetails(queryId);
            } else {
                // Hiçbir ID yoksa, giriş yapmış kullanıcının profilini getirmeyi dene
                this.getCurrentInstructor();
            }
        });
      }
    });
  }

  // --- Veri Çekme İşlemleri ---

  // ID'ye göre eğitmen detayını getir (Public)
  getInstructorDetails(id: string): void {
    this.isLoading = true;
    this.instructorApi.getInstructorById(id).subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.instructorProfile = res.data;
          this.checkOwnership();
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  // Giriş yapmış kullanıcının eğitmen profilini getir (Private)
  getCurrentInstructor(): void {
    // Önce kullanıcı login mi kontrol et
    const user = (this.authService as any).currentUserValue || (this.authService as any).user || JSON.parse(localStorage.getItem('user') || 'null');
    
    if(!user){
        this.isLoading = false;
        return;
    }

    this.isLoading = true;
    this.instructorApi.getCurrentInstructorProfile().subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.instructorProfile = res.data;
          this.isOwner = true; // Kendi profilini çektiği için sahibi odur
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        this.isLoading = false;
        // Eğer 404 dönerse, kullanıcı henüz eğitmen değildir.
      }
    });
  }

  // Kullanıcı bu profilin sahibi mi? (Düzenle butonunu göstermek için)
  checkOwnership(): void {
    const currentUser = (this.authService as any).currentUserValue || (this.authService as any).user || JSON.parse(localStorage.getItem('user') || 'null');
    // Backend'den gelen 'appUserId' ile token'daki ID eşleşiyor mu?
    if (currentUser && this.instructorProfile && currentUser.id === this.instructorProfile.appUserId) {
      this.isOwner = true;
    }
  }

  // --- Edit Mode & Form İşlemleri ---

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    // Edit moda geçerken formu mevcut verilerle doldur
    if (this.isEditMode && this.instructorProfile) {
      this.initForm();
    }
  }

  initForm(): void {
    if (!this.instructorProfile) return;

    this.editForm.patchValue({
      title: this.instructorProfile.title,
      bio: this.instructorProfile.bio,
      imageUrl: this.instructorProfile.imageUrl,
      socialMedia: {
        facebook: this.instructorProfile.socialMedia?.facebook || '',
        twitter: this.instructorProfile.socialMedia?.twitter || '',
        linkedin: this.instructorProfile.socialMedia?.linkedin || '',
        instagram: this.instructorProfile.socialMedia?.instagram || '',
        website: this.instructorProfile.socialMedia?.website || ''
      }
    });
  }

  cancelEdit(): void {
    this.isEditMode = false;
  }

  saveProfile(): void {
    if (this.editForm.invalid) {
      this.toastr.warning('Lütfen gerekli alanları doldurun.');
      return;
    }

    this.isSubmitting = true;
    const updateData = this.editForm.value;

    this.instructorApi.updateInstructorProfile(updateData).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        if (res.success) {
          this.toastr.success('Profil güncellendi.');
          // UI'ı anlık güncelle ki sayfa yenilemeye gerek kalmasın
          this.instructorProfile = { ...this.instructorProfile!, ...updateData };
          this.isEditMode = false;
        } else {
          this.toastr.error(res.message || 'Bir hata oluştu.');
        }
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.toastr.error('Güncelleme sırasında hata oluştu.');
      }
    });
  }

  // --- Resim Seçme (Modal) İşlemleri ---

  openLibrary(): void {
    this.showLibraryModal = true;
  }

  closeLibrary(): void {
    this.showLibraryModal = false;
  }

  // Selector'dan returnType="path" istediğimiz için bize string URL gelecek
  onImageSelected(path: string): void {
    if(path) {
        this.editForm.patchValue({ imageUrl: path });
        this.toastr.info('Resim seçildi. Değişiklikleri kaydetmeyi unutmayın.');
    }
    this.closeLibrary();
  }
}