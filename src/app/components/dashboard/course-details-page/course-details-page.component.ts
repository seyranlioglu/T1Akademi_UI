import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { combineLatest } from 'rxjs';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { CartService } from 'src/app/shared/services/cart.service';
import { PublicContent, PublicCourseDetail, CourseActionType } from 'src/app/shared/models/public-course-detail.model';
import * as bootstrap from 'bootstrap';

@Component({
    selector: 'app-course-details-page',
    templateUrl: './course-details-page.component.html',
    styleUrls: ['./course-details-page.component.scss']
})
export class CourseDetailsPageComponent implements OnInit {

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
        private sanitizer: DomSanitizer
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
            next: (data: PublicCourseDetail) => {
                this.course = data;
                if (!this.course.tqs) this.course.tqs = 95;
                if (!this.course.availableActions) this.course.availableActions = [];
                this.isLoading = false;
            },
            error: (err) => {
                console.error("Kurs detay hatası:", err);
                this.isLoading = false;
                if (err.status === 404) {
                    this.errorMsg = "Eğitim bulunamadı veya yayında değil.";
                } else {
                    this.errorMsg = "Eğitim bilgileri yüklenirken bir sorun oluştu.";
                }
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

        this.toastTimeout = setTimeout(() => {
            this.showToast = false;
        }, 4000);
    }

    // =======================================================
    // GERÇEK AKSİYON METOTLARI
    // =======================================================

    goToTraining() {
        this.router.navigate(['/learning', this.courseId]);
    }

    assignToEmployees() {
        this.router.navigate(['/company/assign-training'], { queryParams: { trainingId: this.courseId } });
    }

    addToLibraryFree() {
        this.isAddingToCart = true;
        this.trainingApi.addToLibrary(this.courseId).subscribe({
            next: (res) => {
                this.isAddingToCart = false;
                if (res?.header?.result) {
                    this.showNotification('Eğitim şirket kütüphanenize ücretsiz eklendi!', 'success');
                    this.loadCourseData(); 
                } else {
                    const errorMsg = res?.header?.msg || 'Kütüphaneye eklenirken bir hata oluştu.';
                    this.showNotification(errorMsg, 'error');
                }
            },
            error: (err) => {
                this.isAddingToCart = false;
                const errorMsg = err.error?.header?.msg || 'Kütüphaneye eklenirken sistemsel bir hata oluştu.';
                this.showNotification(errorMsg, 'error');
            }
        });
    }

    requestTraining() {
        this.trainingApi.requestTraining(this.courseId).subscribe({
            next: (res) => {
                if (res?.header?.result) {
                    this.showNotification('Talebiniz yöneticinize iletildi.', 'success');
                } else {
                    const errorMsg = res?.header?.msg || 'Talep gönderilirken hata oluştu.';
                    this.showNotification(errorMsg, 'error');
                }
            },
            error: (err) => {
                const errorMsg = err.error?.header?.msg || 'Talep gönderilemedi.';
                this.showNotification(errorMsg, 'error');
            }
        });
    }

    requestLicense() {
        this.requestTraining();
    }

    requestPurchase() {
        this.requestTraining();
    }

    // =======================================================
    // SEPET İŞLEMLERİ
    // =======================================================

    openCartModal() {
        if (!this.course) return;

        this.pricingTiers = [];
        this.selectedTier = null;
        this.modalTotalPrice = 0;
        this.licenseCount = 1;

        if (!this.cartModal) {
            this.cartModal = new bootstrap.Modal(this.addToCartModalEl.nativeElement);
        }
        this.cartModal.show();

        if (this.course.priceTierId && this.course.priceTierId > 0) {
            this.trainingApi.getTierPricing(this.course.priceTierId).subscribe({
                next: (res: any) => {
                    const data = res.data || res.body || res;
                    if (Array.isArray(data) && data.length > 0) {
                        this.pricingTiers = data;
                        this.selectTier(this.pricingTiers[0]);
                    } else {
                        this.calculateModalTotal();
                    }
                },
                error: (err) => {
                    console.error("Fiyatlar çekilemedi", err);
                    this.calculateModalTotal();
                }
            });
        } else {
            this.calculateModalTotal();
        }
    }

    selectTier(tier: any) {
        this.selectedTier = tier;
        this.licenseCount = tier.minLicenceCount > 1 ? tier.minLicenceCount : 1;
        this.calculateModalTotal();
    }

    increaseCount() {
        this.licenseCount++;
        this.handleCountChangeLogic();
    }

    decreaseCount() {
        if (this.licenseCount > 1) {
            this.licenseCount--;
            this.handleCountChangeLogic();
        }
    }

    onCountChange(event: any) {
        let val = parseInt(event.target.value);
        if (isNaN(val) || val < 1) val = 1;
        this.licenseCount = val;
        this.handleCountChangeLogic();
    }

    handleCountChangeLogic() {
        if (this.pricingTiers.length > 0) {
            const val = this.licenseCount;
            const matchingTier = this.pricingTiers.find(t => val >= t.minLicenceCount && val <= t.maxLicenceCount);
            const lastTier = this.pricingTiers[this.pricingTiers.length - 1];

            if (matchingTier) {
                this.selectedTier = matchingTier;
            } else if (val > lastTier.maxLicenceCount) {
                this.selectedTier = lastTier;
            }
        }
        this.calculateModalTotal();
    }

    calculateModalTotal() {
        if (this.selectedTier) {
            let unitPrice = this.selectedTier.amount;
            if (this.selectedTier.discountRate > 0) {
                unitPrice = unitPrice - (unitPrice * (this.selectedTier.discountRate / 100));
            }
            this.modalTotalPrice = unitPrice * this.licenseCount;
        } else {
            if (this.course) {
                this.modalTotalPrice = this.course.currentAmount * this.licenseCount;
            }
        }
    }

    confirmAddToCart() {
        if (!this.course) return;
        this.isAddingToCart = true;
        this.cartService.addToCart(this.course.id, this.licenseCount).subscribe({
            next: (res: any) => {
                this.isAddingToCart = false;
                const isSuccess = res.isSuccess || (res.header && res.header.result);
                if (isSuccess) {
                    this.cartModal.hide();
                    this.showNotification('Sepet başarıyla güncellendi!', 'success');
                } else {
                    const errorMsg = res.header?.msg || res.message || 'Bir hata oluştu.';
                    this.showNotification(errorMsg, 'error');
                }
            },
            error: (err) => {
                this.isAddingToCart = false;
                this.showNotification('Sunucu ile iletişim hatası.', 'error');
            }
        });
    }

    // =======================================================
    // YARDIMCI METOTLAR
    // =======================================================

    toggleWishlist() { 
        this.showNotification('İstek listesine eklendi!', 'success'); 
    }

    shareCourse() {
        navigator.clipboard.writeText(window.location.href);
        this.showNotification('Kurs bağlantısı kopyalandı!', 'success');
    }

    applyCoupon() { 
        this.showNotification('Kupon sistemi yakında aktif olacak.', 'error'); 
    }

    startSubscription() {
        this.router.navigate(['/b2b-subscription-plans']);
    }

    goToCategory(categoryName: string) {
        this.router.navigate(['/courses'], { queryParams: { search: categoryName } });
    }

    showAllReviews() { 
        this.showNotification('Yorum sayfası hazırlanıyor...', 'error'); 
    }

    openPromoVideo() {
        if (this.course && this.course.previewVideoPath) {
            this.currentPreviewTitle = "Kurs Tanıtımı";
            this.currentPreviewType = 'video';
            const safeUrl = this.getYouTubeEmbedUrl(this.course.previewVideoPath);
            this.currentPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(safeUrl);
            this.openModal();
        }
    }

    openContentPreview(content: PublicContent) {
        if (!content.isPreview) return;
        this.currentPreviewTitle = content.title;
        if (content.type === 'exam') {
            this.currentPreviewType = 'exam';
            this.currentPreviewUrl = null;
        } else if (content.filePath) {
            this.currentPreviewType = content.type as any;
            let finalUrl = content.filePath;
            if (this.currentPreviewType === 'video' && (finalUrl.includes('youtube') || finalUrl.includes('youtu.be'))) {
                finalUrl = this.getYouTubeEmbedUrl(finalUrl);
            }
            this.currentPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl);
        }
        this.openModal();
    }

    private openModal() {
        this.isPreviewOpen = true;
        document.body.style.overflow = 'hidden';
    }

    closePreview() {
        this.isPreviewOpen = false;
        this.currentPreviewUrl = null;
        document.body.style.overflow = 'auto';
    }

    private getYouTubeEmbedUrl(url: string): string {
        if (!url) return '';
        if (url.includes('/embed/')) return url;
        let videoId = '';
        if (url.includes('youtu.be')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('youtube.com/watch')) {
            const urlParams = new URLSearchParams(new URL(url).search);
            videoId = urlParams.get('v') || '';
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
}