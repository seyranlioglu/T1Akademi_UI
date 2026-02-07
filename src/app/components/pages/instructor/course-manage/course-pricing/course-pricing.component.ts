import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';

@Component({
  selector: 'app-course-pricing',
  templateUrl: './course-pricing.component.html',
  styleUrls: ['./course-pricing.component.scss'],
  providers: [MessageService]
})
export class CoursePricingComponent implements OnInit, OnChanges {

  @Input() course: any | null = null;
  form!: FormGroup;
  isSaving: boolean = false;

  // Statik veriler (Daha sonra API'den çekilebilir)
  priceTiers = [
    { id: 1, title: 'Ücretsiz', amount: 0 },
    { id: 2, title: 'Tier 1 (₺249.99)', amount: 249.99 },
    { id: 3, title: 'Tier 2 (₺499.99)', amount: 499.99 },
    { id: 4, title: 'Tier 3 (₺799.99)', amount: 799.99 },
  ];

  constructor(
    private fb: FormBuilder,
    private trainingApi: TrainingApiService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.initForm();
    if (this.course) this.updateFormValues();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['course'] && changes['course'].currentValue) {
      this.updateFormValues();
    }
  }

  initForm() {
    this.form = this.fb.group({
      priceTierId: [null, [Validators.required]],
      discountRate: [0], // İndirim oranı opsiyonel
      includedInSubscription: [true] // Aboneliğe dahil mi?
    });
  }

  updateFormValues() {
    if (!this.course) return;

    this.form.patchValue({
      priceTierId: this.course.priceTierId || null,
      discountRate: this.course.discountRate || 0,
      includedInSubscription: this.course.includedInSubscription ?? true
    });
  }

  savePricingTier() {
    if (this.form.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Uyarı', detail: 'Lütfen bir fiyat kademesi seçiniz.' });
      return;
    }

    if (!this.course?.id) return;

    this.isSaving = true;

    // Backend: UpdateCoursePricingDto yapısı
    const dto = {
      id: this.course.id,
      priceTierId: Number(this.form.value.priceTierId),
      discountRate: this.form.value.discountRate,
      includedInSubscription: this.form.value.includedInSubscription,
      amount: null // Tier seçildiği için amount'u backend tier'dan alacak
    };

    this.trainingApi.updateCoursePricing(dto).subscribe({
      next: (res) => {
        if (res.result) {
          this.messageService.add({ severity: 'success', summary: 'Başarılı', detail: 'Fiyatlandırma güncellendi.' });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Hata', detail: res.message });
        }
        this.isSaving = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Hata', detail: 'Sunucu hatası oluştu.' });
        this.isSaving = false;
      }
    });
  }
}