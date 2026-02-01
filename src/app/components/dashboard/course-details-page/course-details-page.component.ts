import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingApiService } from 'src/app/shared/api/training-api.service'; // 🔥 TrainingApi kullanıyoruz
import { CartService } from 'src/app/shared/services/cart.service';
import { PublicCourseDetail } from 'src/app/shared/models/public-course-detail.model';  

@Component({
    selector: 'app-course-details-page',
    templateUrl: './course-details-page.component.html',
    styleUrls: ['./course-details-page.component.scss']
})
export class CourseDetailsPageComponent implements OnInit {

    courseId!: number;
    course: PublicCourseDetail | null = null;
    isLoading: boolean = true;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private trainingApi: TrainingApiService, // Servisi ekledik
        public cartService: CartService
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            const id = params['id'];
            if (id) {
                this.courseId = +id;
                this.loadCourseData();
            }
        });
    }

    loadCourseData() {
        this.isLoading = true;
        // Servisteki map() işlemi sayesinde data direkt obje olarak geliyor
        this.trainingApi.getTrainingPublicDetail(this.courseId).subscribe({
            next: (data) => {
                this.course = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error("Kurs detay hatası:", err);
                this.isLoading = false;
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