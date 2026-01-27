import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { CartService } from 'src/app/shared/services/cart.service';

@Component({
    selector: 'app-course-details-page',
    templateUrl: './course-details-page.component.html',
    styleUrls: ['./course-details-page.component.scss']
})
export class CourseDetailsPageComponent implements OnInit {

    trainingId: number = 0;
    training: any = null; // HTML'de "training" kullanılacak
    isLoading = true;
    currentTab = 'tab1';
    isOpen = false;
    safeVideoUrl: SafeResourceUrl | null = null;
    openSectionIndex: number = 0; 

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private trainingService: TrainingApiService,
        private cartService: CartService,
        private sanitizer: DomSanitizer
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.trainingId = +params['id'];
                this.loadTrainingDetail();
            } else {
                this.router.navigate(['/']);
            }
        });
    }

    loadTrainingDetail() {
        this.isLoading = true;
        this.trainingService.getTrainingPublicDetail(this.trainingId).subscribe({
            next: (res: any) => {
                this.training = res.data || res.body || res;
                this.isLoading = false;

                if (this.training?.previewVideoPath) {
                    this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.training.previewVideoPath);
                }
            },
            error: (err) => {
                console.error("Hata:", err);
                this.isLoading = false;
            }
        });
    }

    switchTab(event: MouseEvent, tab: string) {
        event.preventDefault();
        this.currentTab = tab;
    }

    toggleSection(index: number): void {
        if (this.openSectionIndex === index) {
            this.openSectionIndex = -1;
        } else {
            this.openSectionIndex = index;
        }
    }

    isSectionOpen(index: number): boolean {
        return this.openSectionIndex === index;
    }

    openPopup(): void {
        if (this.safeVideoUrl) this.isOpen = true;
    }

    closePopup(): void {
        this.isOpen = false;
    }

    addToCart() {
        if (!this.training) return;
        this.cartService.addToCart(this.training.id, 1).subscribe({
            next: (res) => console.log("Sepete eklendi"),
            error: (err) => console.error(err)
        });
    }

    buyNow() {
        if (!this.training) return;
        this.cartService.addToCart(this.training.id, 1).subscribe({
            next: (res) => this.router.navigate(['/dashboard/cart'])
        });
    }
}