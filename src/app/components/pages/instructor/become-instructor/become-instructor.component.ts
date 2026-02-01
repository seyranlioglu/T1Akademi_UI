import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
// Relative path kullanarak import hatasını çözüyoruz
import { InstructorApiService }  from 'src/app/shared/api/instructor-api.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-become-instructor',
  templateUrl: './become-instructor.component.html',
  styleUrls: ['./become-instructor.component.scss']
})
export class BecomeInstructorComponent implements OnInit {
  instructorForm: FormGroup;
  isSubmitting = false;
  currentUser: any;

  constructor(
    private fb: FormBuilder,
    private instructorApi: InstructorApiService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService 
  ) {
    this.instructorForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      bio: ['', [Validators.required, Validators.minLength(20)]],
      facebook: [''],
      twitter: [''],
      linkedin: [''],
      instagram: [''],
      website: ['']
    });
  }

  ngOnInit(): void {
    // AuthService'de getUser() yoksa, local storage veya currentUserValue kontrolü yapıyoruz.
    // Hata almamak için any cast işlemi veya doğrudan localStorage kontrolü:
    const userStored = localStorage.getItem('user'); 
    // veya authService içindeki public property (genelde currentUserValue olur)
    // Şimdilik güvenli olması için any olarak ele alıyoruz:
    this.currentUser = (this.authService as any).currentUserValue || (userStored ? JSON.parse(userStored) : null);

    if (!this.currentUser) {
      this.toastr.warning('Başvuru yapmak için giriş yapmalısınız.');
      this.router.navigate(['/auth/login']);
    }
  }

  onSubmit(): void {
    if (this.instructorForm.invalid) {
      this.toastr.error('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    this.isSubmitting = true;
    const formValues = this.instructorForm.value;

    const applicationData = {
      title: formValues.title,
      bio: formValues.bio,
      socialMedia: {
        facebook: formValues.facebook,
        twitter: formValues.twitter,
        linkedin: formValues.linkedin,
        instagram: formValues.instagram,
        website: formValues.website
      }
    };

    // 'res' ve 'err' parametrelerine ': any' ekleyerek TS7006 hatasını çözüyoruz
    this.instructorApi.applyAsInstructor(applicationData).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        if (res.success) {
          this.toastr.success('Başvurunuz başarıyla alındı! Onay süreci başladı.');
          this.router.navigate(['/dashboard']); 
        } else {
          this.toastr.error(res.message || 'Başvuru sırasında bir hata oluştu.');
        }
      },
      error: (err: any) => {
        this.isSubmitting = false;
        console.error('Başvuru hatası:', err);
        this.toastr.error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
      }
    });
  }
}