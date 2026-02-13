import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { loadCourse } from 'src/app/shared/store/course.actions';
import { CourseState } from 'src/app/shared/store/course.reducer';

@Component({
    selector: 'app-course-manage',
    templateUrl: './course-manage.component.html',
    styleUrls: ['./course-manage.component.scss'],
})
export class CourseManageComponent implements OnInit, OnDestroy {
    
    courseId!: number;
    course: any = null; // Store'dan gelen eğitim verisi
    currentStatus: string = '1'; // Varsayılan: Preparing

    isLoadingCustomerPreview = false;
    isLoadingStudentPreview = false;
    isSubmitting: boolean = false;

    private courseSub: Subscription = new Subscription();

    constructor(
        private route: ActivatedRoute,
        public router: Router,
        public trainingApiService: TrainingApiService, 
        private store: Store<{ course: CourseState }>,
        private toastr: ToastrService
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            const id = params['id'] || this.route.snapshot.paramMap.get('id');
            
            if (id) {
                this.courseId = +id;
                this.store.dispatch(loadCourse({ courseId: this.courseId }));
            } else {
                this.route.parent?.params.subscribe(parentParams => {
                    if(parentParams['id']) {
                        this.courseId = +parentParams['id'];
                        this.store.dispatch(loadCourse({ courseId: this.courseId }));
                    }
                });
            }
        });

        // 🔥 STORE'DAN EĞİTİM DURUMUNU DİNLE
        // Düzeltme: 'state.course' alanı reducer'da 'state.selectedCourse' olarak tanımlı.
        this.courseSub = this.store.select(state => state.course).subscribe(courseState => {
            if (courseState && courseState.selectedCourse) {
                this.course = courseState.selectedCourse;
                
                // Backend'den gelen TrainingStatus objesinin Code'u veya Id'si
                this.currentStatus = courseState.selectedCourse.trainingStatus?.code || '1'; 
            }
        });
    }

    ngOnDestroy(): void {
        if(this.courseSub) this.courseSub.unsubscribe();
    }

    // HELPER: Eğitim İncelemede mi? (KİLİT)
    get isLocked(): boolean {
        // 2: PendingApproval
        return this.currentStatus === '2';
    }

    // HELPER: Buton Metni
    get submitButtonText(): string {
        if (this.isSubmitting) return 'İşleniyor...';
        
        switch (this.currentStatus) {
            case '2': return 'İnceleme Bekleniyor 🔒'; // Pending
            case '3': return 'Güncellemeleri Onaya Gönder'; // Published (Partial Review)
            case '5': return 'Revizyonu Gönder'; // RevisionNeeded
            default: return 'İnceleme için Gönder'; // Preparing / Canceled
        }
    }

    // 1. MÜŞTERİ GİBİ İZLE
    previewAsCustomer() {
        if (!this.courseId) return;
        this.isLoadingCustomerPreview = true;

        this.trainingApiService.getTrainingPreviewToken(this.courseId).subscribe({
            next: (token) => {
                this.isLoadingCustomerPreview = false;
                // Yan sekmede aç
                const url = this.router.serializeUrl(
                    this.router.createUrlTree(['/course', this.courseId], { queryParams: { previewToken: token } })
                );
                window.open(url, '_blank');
            },
            error: (err) => {
                this.isLoadingCustomerPreview = false;
                this.toastr.error("Önizleme yetkisi alınamadı.");
            }
        });
    }

    // 2. ÖĞRENCİ GİBİ İZLE
    previewAsStudent() {
        if (!this.courseId) return;
        this.isLoadingStudentPreview = true;

        this.trainingApiService.getTrainingPreviewToken(this.courseId).subscribe({
            next: (token) => {
                this.isLoadingStudentPreview = false;
                const url = this.router.serializeUrl(
                    this.router.createUrlTree(['/course-player', this.courseId], { queryParams: { previewToken: token } })
                );
                window.open(url, '_blank');
            },
            error: (err) => {
                this.isLoadingStudentPreview = false;
                this.toastr.error("Önizleme yetkisi alınamadı.");
            }
        });
    }

    // İNCELEMEYE GÖNDER
    submitCourseForReview() {
        if(!this.courseId) return;
        if(this.isLocked) return; // Kilitliyse işlem yapma

        // Mesajı Duruma Göre Özelleştir
        let confirmMsg = 'Eğitiminizi incelemeye göndermek üzeresiniz. Emin misiniz?';
        if (this.currentStatus === '3') {
            confirmMsg = 'Yayındaki eğitiminiz için yaptığınız değişiklikler (yeni içerikler) incelemeye gönderilecek. Onaylanana kadar öğrenciler eski hali görmeye devam eder. Onaylıyor musunuz?';
        }

        if(!confirm(confirmMsg)) return;

        this.isSubmitting = true;

        this.trainingApiService.submitForReview(this.courseId).subscribe({
            next: (res) => {
                this.isSubmitting = false;
                if(res.header.result) {
                    this.toastr.success(res.body.msg || 'Başarıyla gönderildi.');
                    
                    // State'i güncellemek için tekrar yükle
                    this.store.dispatch(loadCourse({ courseId: this.courseId }));
                    
                    // Published ise listede kalabilir, değilse çıkabilir
                    if(this.currentStatus !== '3') {
                        this.router.navigate(['/instructor/courses']); 
                    }
                } else {
                    this.toastr.warning(res.header.msg || 'İşlem başarısız.');
                }
            },
            error: (err) => {
                if (err.error && err.error.header && err.error.header.msg) {
                    // Backend'in gönderdiği özel mesajı göster (Örn: "Zaten bekleyen talep var")
                    this.toastr.warning(err.error.header.msg, 'İşlem Başarısız');
                } else {
                    // Standart hata
                    this.toastr.error('Sunucu hatası oluştu. Lütfen tekrar deneyin.');
                }
                console.error(err);
            }
        });
    }
}