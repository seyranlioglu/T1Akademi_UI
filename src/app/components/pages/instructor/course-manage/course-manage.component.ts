import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr'; // Hata mesajı için ekledik
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
    }

    // 🔥 1. MÜŞTERİ GİBİ İZLE (Vitrin Sayfası)
    previewAsCustomer() {
        if (!this.courseId) return;
        // '/course/:id' genelde vitrin (satış) sayfasıdır.
        const url = this.router.serializeUrl(
            this.router.createUrlTree(['/course', this.courseId]) 
        );
        window.open(url, '_blank');
    }

    // 🔥 2. ÖĞRENCİ GİBİ İZLE (Player - Token ile)
    previewAsStudent() {
        if (!this.courseId) return;

        // Backend'den 1 günlük geçici token alıyoruz
        this.trainingApiService.getTrainingPreviewToken(this.courseId).subscribe({
            next: (res) => {
                const token = res.result || res.token || res; 
                
                // '/course-player/:id' genelde ders izleme ekranıdır.
                // Eğer sende farklıysa (örn: '/watch') burayı güncelle.
                const url = this.router.serializeUrl(
                    this.router.createUrlTree(['/course-player', this.courseId], { 
                        queryParams: { previewToken: token } 
                    })
                );
                
                window.open(url, '_blank');
            },
            error: (err) => {
                console.error("Token hatası:", err);
                this.toastr.error("Önizleme başlatılamadı. Yetkiniz olmayabilir.");
            }
        });
    }
}