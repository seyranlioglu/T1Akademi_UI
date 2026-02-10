import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs'; // 🔥 Memory Leak önlemi
import { Store } from '@ngrx/store'; // 🔥 Store Eklendi

import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { PriceCampaignApiService } from 'src/app/shared/api/price-campaign-api.service';
// Store Importları (Projenin yapısına göre)
import { loadCourse } from 'src/app/shared/store/course.actions';
import { selectSelectedCourse } from 'src/app/shared/store/course.reducer';

@Component({
  selector: 'app-course-pricing',
  templateUrl: './course-pricing.component.html',
  styleUrls: ['./course-pricing.component.scss']
})
export class CoursePricingComponent implements OnInit, OnDestroy {

  @Input() course: any | null = null;
  
  courseId!: number;
  form!: FormGroup;
  isSaving: boolean = false;
  isLoadingTiers: boolean = false;
  
  private destroy$ = new Subject<void>(); // 🔥 Abonelikleri temizlemek için

  priceTiers: any[] = [];
  activeCampaigns: any[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private trainingApi: TrainingApiService,
    private priceCampaignApi: PriceCampaignApiService,
    private toastr: ToastrService,
    private store: Store // 🔥 Store Inject Edildi
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadData(); // Tier ve Kampanya listelerini çek

    // 1. URL'den ID'yi Yakala
    this.route.parent?.params.subscribe(params => {
        if (params['id']) {
            this.courseId = Number(params['id']);
        }
    });

    // 2. STORE'DAN VERİYİ DİNLE (En Güncel Veri Buradadır)
    this.store.select(selectSelectedCourse)
      .pipe(takeUntil(this.destroy$)) // Component kapanınca dinlemeyi bırak
      .subscribe(courseData => {
        if (courseData) {
          console.log("📥 Store'dan Güncel Veri Geldi:", courseData);
          this.course = courseData; // Local değişkeni güncelle
          
          if (!this.courseId && courseData.id) {
             this.courseId = courseData.id;
          }
          
          this.updateFormValues(); // Formu doldur
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm() {
    this.form = this.fb.group({
      priceTierId: [null, [Validators.required]],
      includedInSubscription: [true]
    });
  }

  loadData() {
    this.isLoadingTiers = true;

    // Fiyat Kademelerini Getir
    this.priceCampaignApi.getAllPriceTiers(true).subscribe({
      next: (res: any) => {
        if (res.header?.result) {
          const rawData = res.body || []; 
          this.priceTiers = rawData.map((tier: any) => {
            const baseDetail = tier.details?.find((d: any) => d.minLicenceCount <= 1);
            const priceLabel = baseDetail ? `${baseDetail.amount} ${tier.currency}` : 'Fiyat Belirlenmedi';
            return {
              ...tier,
              displayLabel: `${tier.title} - ${priceLabel}`,
              baseAmount: baseDetail ? baseDetail.amount : 0,
              sortedDetails: (tier.details || []).sort((a: any, b: any) => a.minLicenceCount - b.minLicenceCount)
            };
          });
          
          // 🔥 Tier listesi yüklendiğinde, eğer formda bir değer varsa (Store'dan gelen),
          // dropdown'ın doğru görünmesi için tetikleyebiliriz.
          this.updateFormValues(); 
        }
        this.isLoadingTiers = false;
      },
      error: () => {
        this.toastr.error('Fiyat listesi yüklenirken hata oluştu.');
        this.isLoadingTiers = false;
      }
    });

    // Kampanyaları Getir
    this.priceCampaignApi.getAvailableCampaigns().subscribe({
      next: (res: any) => {
        if (res.header?.result) {
          this.activeCampaigns = res.body || [];
        }
      }
    });
  }

  updateFormValues() {
    // Hem course verisi hem de form hazır olmalı
    if (!this.course || !this.form) return;

    this.form.patchValue({
      priceTierId: this.course.priceTierId || null,
      includedInSubscription: this.course.includedInSubscription ?? true
    }, { emitEvent: false }); // Sonsuz döngüye girmesin diye event yaymayı durdur
  }

  get selectedTierInfo() {
    const selectedId = Number(this.form.get('priceTierId')?.value);
    return this.priceTiers.find(t => t.id === selectedId);
  }

  savePricingTier() {
    if (this.form.invalid) {
      this.toastr.warning('Lütfen bir fiyat kademesi seçiniz.', 'Eksik Bilgi');
      this.form.markAllAsTouched();
      return;
    }

    if (!this.courseId) {
        this.toastr.error('Eğitim ID bulunamadı. Sayfayı yenileyiniz.', 'Hata');
        return;
    }

    this.isSaving = true;

    const dto = {
      Id: this.courseId,
      PriceTierId: Number(this.form.value.priceTierId),
      Amount: null, 
      DiscountRate: null, 
      IncludedInSubscription: this.form.value.includedInSubscription
    };

    this.trainingApi.updateCoursePricing(dto).subscribe({
      next: (res) => {
        if (res.header ? res.header.result : res.result) {
          this.toastr.success('Fiyatlandırma bilgileri güncellendi.', 'Başarılı');
          
          // 🔥 KRİTİK NOKTA: İşlem başarılı olunca Store'u güncelle!
          // Backend'den en güncel veriyi çekip tüm uygulamaya yayıyoruz.
          this.store.dispatch(loadCourse({ courseId: this.courseId })); 
          
        } else {
          this.toastr.error(res.header?.msg || res.message || 'İşlem başarısız.', 'Hata');
        }
        this.isSaving = false;
      },
      error: (err) => {
        console.error("API Hatası:", err);
        this.toastr.error('Sunucu hatası oluştu.', 'Hata');
        this.isSaving = false;
      }
    });
  }
}