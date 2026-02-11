import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { loadCourse } from 'src/app/shared/store/course.actions';
import { CourseState } from 'src/app/shared/store/course.reducer';

@Component({
    selector: 'app-course-manage',
    templateUrl: './course-manage.component.html',
    styleUrls: ['./course-manage.component.scss'],
})
export class CourseManageComponent implements OnInit {
    
    courseId!: number;
    isLoadingCustomerPreview = false;
    isLoadingStudentPreview = false;
    
    // Gönderim işlemi için loading durumu
    isSubmitting: boolean = false;

    constructor(
        private route: ActivatedRoute,
        public router: Router,
        public trainingApiService: TrainingApiService, 
        private store: Store<{ course: CourseState }>,
        private toastr: ToastrService
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            // Parametreyi hem direkt hem snapshot ile kontrol et
            const id = params['id'] || this.route.snapshot.paramMap.get('id');
            
            if (id) {
                this.courseId = +id;
                this.store.dispatch(loadCourse({ courseId: this.courseId }));
            } else {
                // Eğer child route'daysak parent'tan alalım
                this.route.parent?.params.subscribe(parentParams => {
                    if(parentParams['id']) {
                        this.courseId = +parentParams['id'];
                        this.store.dispatch(loadCourse({ courseId: this.courseId }));
                    }
                });
            }
        });
    }

    // 1. MÜŞTERİ GİBİ İZLE (Vitrin Sayfası - Token İle)
    previewAsCustomer() {
        if (!this.courseId) return;

        this.isLoadingCustomerPreview = true;

        // Backend'den geçici token iste
        this.trainingApiService.getTrainingPreviewToken(this.courseId).subscribe({
            next: (token) => {
                this.isLoadingCustomerPreview = false;
                
                // Token ile birlikte Vitrin sayfasına git (/course/:id)
                const url = this.router.serializeUrl(
                    this.router.createUrlTree(['/course', this.courseId], { 
                        queryParams: { previewToken: token } 
                    })
                );
                window.open(url, '_blank');
            },
            error: (err) => {
                console.error("Token hatası:", err);
                this.isLoadingCustomerPreview = false;
                this.toastr.error("Önizleme başlatılamadı. Yetkiniz olmayabilir.", "Hata");
            }
        });
    }

    // 2. ÖĞRENCİ GİBİ İZLE (Player - Token İle)
    previewAsStudent() {
        if (!this.courseId) return;

        this.isLoadingStudentPreview = true;

        // Backend'den geçici token iste (Aynı token metodu kullanılabilir)
        this.trainingApiService.getTrainingPreviewToken(this.courseId).subscribe({
            next: (token) => {
                this.isLoadingStudentPreview = false;
                
                // Token ile birlikte Player sayfasına git (/course-player/:id)
                const url = this.router.serializeUrl(
                    this.router.createUrlTree(['/course-player', this.courseId], { 
                        queryParams: { previewToken: token } 
                    })
                );
                window.open(url, '_blank');
            },
            error: (err) => {
                console.error("Token hatası:", err);
                this.isLoadingStudentPreview = false;
                this.toastr.error("Önizleme başlatılamadı. Yetkiniz olmayabilir.", "Hata");
            }
        });
    }

    // İNCELEMEYE GÖNDER METODU
    submitCourseForReview() {
        if(!this.courseId) return;

        // Kullanıcıdan son bir onay alalım
        if(!confirm('Eğitiminizi incelemeye göndermek üzeresiniz. Emin misiniz?')) return;

        this.isSubmitting = true;

        this.trainingApiService.submitForReview(this.courseId).subscribe({
            next: (res) => {
                this.isSubmitting = false;
                
                if(res.header.result) {
                    // Başarılı
                    this.toastr.success(res.body.message || 'Eğitim başarıyla gönderildi.');
                    // Listeye geri dönelim
                    this.router.navigate(['/instructor/courses']); 
                } else {
                    // Validasyon Hatası (Örn: Kategori yok, Fiyat yok vb.)
                    // Backend'den gelen detaylı mesajı gösteriyoruz.
                    this.toastr.warning(res.header.msg || 'İşlem başarısız.', 'Eksik Bilgi');
                }
            },
            error: (err) => {
                this.isSubmitting = false;
                this.toastr.error('Sunucu hatası oluştu. Lütfen tekrar deneyin.');
                console.error(err);
            }
        });
    }
}