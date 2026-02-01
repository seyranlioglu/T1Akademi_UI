import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { CartService } from 'src/app/shared/services/cart.service';
import { PublicCourseDetail } from 'src/app/shared/models/public-course-detail.model';
import { combineLatest } from 'rxjs';

@Component({
    selector: 'app-course-details-page',
    templateUrl: './course-details-page.component.html',
    styleUrls: ['./course-details-page.component.scss']
})
export class CourseDetailsPageComponent implements OnInit {

    courseId!: number;
    previewToken: string | null = null;
    course: PublicCourseDetail | null = null;
    isLoading: boolean = true;
    errorMsg: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private trainingApi: TrainingApiService,
        public cartService: CartService
    ) { }

    ngOnInit(): void {
        // Hem parametreleri (id) hem query parametrelerini (token) aynı anda dinleyelim
        combineLatest([this.route.params, this.route.queryParams]).subscribe(([params, queryParams]) => {
            const id = params['id'];
            this.previewToken = queryParams['previewToken'];

            if (id) {
                this.courseId = +id;
                this.loadCourseData();
            }
        });
    }

    loadCourseData() {
        this.isLoading = true;
        this.errorMsg = null;

        // previewToken varsa servise gönderiyoruz (undefined ise zaten gitmez)
        this.trainingApi.getTrainingPublicDetail(this.courseId, this.previewToken || undefined).subscribe({
            next: (data) => {
                this.course = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error("Kurs detay hatası:", err);
                this.isLoading = false;
                if (err.status === 404) {
                    this.errorMsg = "Eğitim bulunamadı veya yayında değil.";
                } else if (err.status === 403) {
                    this.errorMsg = "Önizleme süresi dolmuş veya yetkiniz yok.";
                } else {
                    this.errorMsg = "Bir hata oluştu.";
                }
            }
        });
    }

    addToCart() {
        if (this.course) {
            this.cartService.addToCart(this.course.id);
        }
    }

    buyNow() {
        if (this.course) {
            this.cartService.addToCart(this.course.id);
            this.router.navigate(['/dashboard/cart']);
        }
    }
}