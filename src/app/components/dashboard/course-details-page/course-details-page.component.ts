import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { CartService } from 'src/app/shared/services/cart.service';
import { PublicCourseDetail } from 'src/app/shared/models/public-course-detail.model';
import { combineLatest } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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

    // --- VIDEO MODAL DEĞİŞKENLERİ ---
    isVideoOpen: boolean = false;
    currentVideoUrl: SafeResourceUrl | null = null;
    currentVideoTitle: string = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private trainingApi: TrainingApiService,
        public cartService: CartService,
        private sanitizer: DomSanitizer // Güvenlik için şart
    ) { }

    ngOnInit(): void {
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

    // --- VİDEO ÖNİZLEME FONKSİYONU ---
    openPreviewVideo(videoPath: string | null, title: string) {
        if (!videoPath) return;

        // Gelen linki güvenli hale getir (Youtube embed, MP4 vb. için)
        // Not: Eğer Youtube linki ise "watch?v=" yerine "embed/" formatında olması gerekir.
        // Backend'in bunu düzgün gönderdiğini varsayıyoruz veya burada replace yapılabilir.
        
        this.currentVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(videoPath);
        this.currentVideoTitle = title;
        this.isVideoOpen = true;
        
        // Modal açılınca scroll'u kitleyelim
        document.body.style.overflow = 'hidden';
    }

    closeVideo() {
        this.isVideoOpen = false;
        this.currentVideoUrl = null;
        this.currentVideoTitle = '';
        
        // Scroll'u geri aç
        document.body.style.overflow = 'auto';
    }
}