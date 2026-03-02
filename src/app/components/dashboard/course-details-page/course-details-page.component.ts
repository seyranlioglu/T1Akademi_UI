import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { combineLatest } from 'rxjs';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { CartService } from 'src/app/shared/services/cart.service';
import { PublicContent, PublicCourseDetail, CourseActionType } from 'src/app/shared/models/public-course-detail.model';
import * as bootstrap from 'bootstrap';
import { MatDialog } from '@angular/material/dialog';
import { AssignTrainingComponent } from 'src/app/components/pages/assign-training/assign-training.component';

@Component({
    selector: 'app-course-details-page',
    templateUrl: './course-details-page.component.html',
    styleUrls: ['./course-details-page.component.scss']
})
export class CourseDetailsPageComponent implements OnInit, OnDestroy {

    public ActionTypes = CourseActionType;
    courseId!: number;
    previewToken: string | null = null;
    course: PublicCourseDetail | null = null;
    isLoading: boolean = true;
    errorMsg: string | null = null;
    toastMessage: string = '';
    showToast: boolean = false;
    toastType: 'success' | 'error' = 'success';
    private toastTimeout: any;
    isPreviewOpen: boolean = false;
    currentPreviewUrl: SafeResourceUrl | null = null;
    currentPreviewTitle: string = '';
    currentPreviewType: 'video' | 'image' | 'pdf' | 'exam' = 'video';
    pricingTiers: any[] = [];
    selectedTier: any = null;
    licenseCount: number = 1;
    modalTotalPrice: number = 0;
    isAddingToCart: boolean = false;
    private cartModal: any;

    @ViewChild('addToCartModal') addToCartModalEl!: ElementRef;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private trainingApi: TrainingApiService,
        public cartService: CartService,
        private sanitizer: DomSanitizer,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        document.body.classList.add('hide-sidebar-page');
        combineLatest([this.route.params, this.route.queryParams]).subscribe(([params, queryParams]) => {
            const id = params['id'];
            this.previewToken = queryParams['previewToken'];
            if (id) {
                this.courseId = +id;
                this.loadCourseData();
            }
        });
    }

    ngOnDestroy(): void {
        document.body.classList.remove('hide-sidebar-page');
    }

    loadCourseData() {
        this.isLoading = true;
        this.errorMsg = null;
        this.trainingApi.getTrainingPublicDetail(this.courseId, this.previewToken || undefined).subscribe({
            next: (data: PublicCourseDetail) => {
                this.course = data;
                if (!this.course.tqs) this.course.tqs = 95;
                if (!this.course.availableActions) this.course.availableActions = [];
                this.isLoading = false;
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMsg = "Eğitim bilgileri yüklenirken bir sorun oluştu.";
            }
        });
    }

    hasAction(action: CourseActionType): boolean {
        return this.course?.availableActions?.includes(action) ?? false;
    }

    showNotification(message: string, type: 'success' | 'error') {
        this.toastMessage = message;
        this.toastType = type;
        this.showToast = true;
        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => { this.showToast = false; }, 4000);
    }

    goToTraining() { this.router.navigate(['/course', this.courseId, 'watch']); }

    assignToEmployees() {
        this.dialog.open(AssignTrainingComponent, {
            width: '95vw', maxWidth: '1200px', height: '65vh', autoFocus: false,
            data: { preSelectedTrainingId: (this.course as any)?.currAccTrainingId || this.courseId, keepOpenAfterSuccess: false }
        });
    }

    addToLibraryFree() {
        this.isAddingToCart = true;
        this.trainingApi.addToLibrary(this.courseId).subscribe({
            next: (res) => {
                this.isAddingToCart = false;
                if (res?.header?.result) { this.showNotification('Kütüphaneye eklendi!', 'success'); this.loadCourseData(); }
            }
        });
    }

    requestTraining() {
        this.trainingApi.requestTraining(this.courseId).subscribe({
            next: (res) => { if (res?.header?.result) this.showNotification('Talebiniz iletildi.', 'success'); }
        });
    }

    requestLicense() { this.requestTraining(); }
    requestPurchase() { this.requestTraining(); }

    openCartModal() {
        if (!this.course) return;
        this.pricingTiers = []; this.selectedTier = null; this.modalTotalPrice = 0; this.licenseCount = 1;
        if (!this.cartModal) { this.cartModal = new bootstrap.Modal(this.addToCartModalEl.nativeElement); }
        this.cartModal.show();
        if (this.course.priceTierId && this.course.priceTierId > 0) {
            this.trainingApi.getTierPricing(this.course.priceTierId).subscribe({
                next: (res: any) => {
                    const data = res.data || res.body || res;
                    if (Array.isArray(data) && data.length > 0) { this.pricingTiers = data; this.selectTier(this.pricingTiers[0]); }
                }
            });
        } else { this.calculateModalTotal(); }
    }

    selectTier(tier: any) { this.selectedTier = tier; this.calculateModalTotal(); }
    increaseCount() { this.licenseCount++; this.calculateModalTotal(); }
    decreaseCount() { if (this.licenseCount > 1) { this.licenseCount--; this.calculateModalTotal(); } }
    onCountChange(event: any) { this.licenseCount = parseInt(event.target.value) || 1; this.calculateModalTotal(); }
    
    calculateModalTotal() {
        if (this.selectedTier) {
            let up = this.selectedTier.amount;
            if (this.selectedTier.discountRate > 0) up = up - (up * (this.selectedTier.discountRate / 100));
            this.modalTotalPrice = up * this.licenseCount;
        } else if (this.course) { this.modalTotalPrice = this.course.currentAmount * this.licenseCount; }
    }

    confirmAddToCart() {
        this.cartService.addToCart(this.course!.id, this.licenseCount).subscribe({
            next: (res: any) => { if (res.isSuccess || (res.header && res.header.result)) { this.cartModal.hide(); this.showNotification('Sepet güncellendi!', 'success'); } }
        });
    }

    toggleWishlist() { this.showNotification('İstek listesine eklendi!', 'success'); }
    shareCourse() { navigator.clipboard.writeText(window.location.href); this.showNotification('Bağlantı kopyalandı!', 'success'); }
    applyCoupon() { this.showNotification('Kupon yakında.', 'error'); }
    startSubscription() { this.router.navigate(['/b2b-subscription-plans']); }
    goToCategory(categoryName: string) { this.router.navigate(['/courses'], { queryParams: { search: categoryName } }); }

    openPromoVideo() {
        if (this.course && this.course.previewVideoPath) {
            this.currentPreviewTitle = "Eğitim Tanıtımı";
            this.currentPreviewType = 'video';
            const safeUrl = this.getYouTubeEmbedUrl(this.course.previewVideoPath);
            this.currentPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(safeUrl);
            this.openModal();
        }
    }

    openContentPreview(content: PublicContent) {
        if (!content.isPreview) return;
        this.currentPreviewTitle = content.title;
        this.currentPreviewType = content.type as any;
        let finalUrl = content.filePath!;
        if (this.currentPreviewType === 'video' && (finalUrl.includes('youtube') || finalUrl.includes('youtu.be'))) finalUrl = this.getYouTubeEmbedUrl(finalUrl);
        this.currentPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl);
        this.openModal();
    }

    private openModal() { this.isPreviewOpen = true; document.body.style.overflow = 'hidden'; }
    closePreview() { this.isPreviewOpen = false; this.currentPreviewUrl = null; document.body.style.overflow = 'auto'; }

    private getYouTubeEmbedUrl(url: string): string {
        if (!url) return '';
        if (url.includes('/embed/')) return url;
        let videoId = '';
        if (url.includes('youtu.be')) videoId = url.split('youtu.be/')[1].split('?')[0];
        else if (url.includes('youtube.com/watch')) videoId = new URLSearchParams(new URL(url).search).get('v') || '';
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
}