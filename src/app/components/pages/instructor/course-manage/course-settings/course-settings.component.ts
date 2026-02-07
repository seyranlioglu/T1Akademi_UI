import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router'; // 🔥 1. IMPORT EKLENDİ
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { CourseState, selectSelectedCourse } from 'src/app/shared/store/course.reducer';
import { loadCourse } from 'src/app/shared/store/course.actions';
import { UpdateCourseSettingsDto } from 'src/app/shared/models/update-course-settings.model';

@Component({
  selector: 'app-course-settings',
  templateUrl: './course-settings.component.html',
  styleUrls: ['./course-settings.component.scss']
})
export class CourseSettingsComponent implements OnInit, OnDestroy {

  course: any = null;
  courseId!: number; // 🔥 2. ID DEĞİŞKENİ EKLENDİ
  form!: FormGroup;
  isSaving: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private trainingApi: TrainingApiService,
    private store: Store<{ course: CourseState }>,
    private route: ActivatedRoute // 🔥 3. ROUTE INJECT EDİLDİ
  ) { }

  ngOnInit(): void {
    this.initForm();

    // 🔥 4. GARANTİ YÖNTEM: ID'yi URL'den alıyoruz (Parent route'dan)
    this.route.parent?.params.subscribe(params => {
        if (params['id']) {
            this.courseId = +params['id'];
            // Eğer store boşsa bu ID ile veriyi yükle (Opsiyonel ama güvenli)
            // this.store.dispatch(loadCourse({ courseId: this.courseId }));
        }
    });

    // Store'dan veriyi dinle
    this.store.select(selectSelectedCourse)
      .pipe(takeUntil(this.destroy$))
      .subscribe(courseData => {
        if (courseData) {
          console.log("Settings - Store'dan Gelen Veri:", courseData);
          this.course = courseData;
          // Eğer courseId URL'den alınamadıysa buradan yedekle
          if(!this.courseId && courseData.id) {
              this.courseId = courseData.id;
          }
          this.updateFormValues();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm() {
    this.form = this.fb.group({
      welcomeMessage: ['', [Validators.maxLength(500)]],
      congratulationMessage: ['', [Validators.maxLength(500)]],
      certificateOfAchievementRate: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      certificateOfParticipationRate: [0, [Validators.min(0), Validators.max(100)]],
      isPrivate: [false]
    });
  }

  updateFormValues() {
    if (!this.course) return;

    this.form.patchValue({
      welcomeMessage: this.course.welcomeMessage,
      congratulationMessage: this.course.congratulationMessage,
      certificateOfAchievementRate: this.course.certificateOfAchievementRate || 0,
      certificateOfParticipationRate: this.course.certificateOfParticipationRate || 0,
      isPrivate: this.course.isPrivate || false
    });
  }

  save() {
    // Debug için log
    console.log("Kaydet basıldı. ID:", this.courseId);

    if (this.form.invalid) {
      this.toastr.warning('Lütfen geçerli değerler giriniz (0-100 arası oranlar vb.).', 'Uyarı');
      this.form.markAllAsTouched();
      return;
    }

    // 🔥 5. KONTROL DEĞİŞTİ: Artık this.course.id yerine URL'den aldığımız courseId'ye bakıyoruz
    if (!this.courseId) {
      this.toastr.error('Eğitim ID bilgisi bulunamadı.', 'Hata');
      return;
    }

    this.isSaving = true;
    const val = this.form.value;

    const dto: UpdateCourseSettingsDto = {
      id: this.courseId, // 🔥 ID ARTIK GARANTİ
      welcomeMessage: val.welcomeMessage,
      congratulationMessage: val.congratulationMessage,
      certificateOfAchievementRate: Number(val.certificateOfAchievementRate),
      certificateOfParticipationRate: Number(val.certificateOfParticipationRate),
      isPrivate: val.isPrivate
    };

    this.trainingApi.updateCourseSettings(dto).subscribe({
      next: (res) => {
        const responseData = res.body || res;
        if (responseData && (responseData.result === true || responseData.success === true)) {
          this.toastr.success('Eğitim ayarları güncellendi.', 'Başarılı');
          // Store'u güncelle
          this.store.dispatch(loadCourse({ courseId: this.courseId }));
        } else {
          this.toastr.error(responseData.message || 'İşlem başarısız.', 'Hata');
        }
        this.isSaving = false;
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Sunucu hatası.', 'Hata');
        this.isSaving = false;
      }
    });
  }

  get f() { return this.form.controls; }
}