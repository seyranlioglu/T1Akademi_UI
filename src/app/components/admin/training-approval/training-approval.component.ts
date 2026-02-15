import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Router eklendi
import { ToastrService } from 'ngx-toastr';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { TrainingProcessService } from 'src/app/shared/api/training-process.service';

declare var bootstrap: any;

@Component({
  selector: 'app-training-approval',
  templateUrl: './training-approval.component.html',
  styleUrls: ['./training-approval.component.scss']
})
export class TrainingApprovalComponent implements OnInit {

  activeTab: string = 'trainings';
  isLoading: boolean = false;
  pendingRequests: any[] = [];

  // Modal Değişkenleri (Sadece Hızlı İşlem için kaldı, Review Modalı kalktı)
  selectedRequest: any = null;
  modalAction: 'approve' | 'reject' | 'revision' = 'approve';
  modalTitle: string = '';
  modalPlaceholder: string = '';
  adminNote: string = '';
  isProcessing: boolean = false;

  constructor(
    private processService: TrainingProcessService,
    private trainingService: TrainingApiService,
    private toastr: ToastrService,
    private router: Router // Inject
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.processService.getPendingRequests().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res && res.header && res.header.result) {
          this.pendingRequests = res.body;
        } else {
          this.pendingRequests = [];
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error('Veriler yüklenirken hata oluştu.');
      }
    });
  }

 openReviewPlayer(request: any) {
  if (!request || !request.trainingId) {
    this.toastr.error("Eğitim ID bulunamadı.");
    return;
  }

  this.isLoading = true; // Ufak bir loading koyalım

  // 1. Önce Backend'den GEÇERLİ bir Preview Token iste
  this.trainingService.getTrainingPreviewToken(request.trainingId).subscribe({
    next: (res: any) => {
      this.isLoading = false;
      
      // Response yapına göre token'ı al (res.data veya res.body olabilir, kontrol et)
      // Senin backend yapında genelde: ProduceSuccessResponse(token) -> res.body veya res.data
      const token = res || res.data || res.body || res.content; 
      if (token) {
        // 2. Token ile Player'ı Aç
        const url = this.router.serializeUrl(
          this.router.createUrlTree(['/course-player', request.trainingId], {
            queryParams: { 
                previewToken: token, // 🔥 ARTIK GERÇEK GUID GİDİYOR
                mode: 'admin',       // Admin HUD'u açmak için
                requestId: request.id 
            }
          })
        );
        window.open(url, '_blank');
      } else {
        this.toastr.error("Önizleme yetkisi alınamadı.");
      }
    },
    error: (err) => {
      this.isLoading = false;
      this.toastr.error("Önizleme tokenı oluşturulamadı.");
    }
  });
}

  // ... (Hızlı Aksiyon Modalı kodları aynı kalabilir) ...
  openActionModal(action: 'approve' | 'reject' | 'revision') {
    this.modalAction = action;
    this.adminNote = '';

    if (action === 'reject') {
      this.modalTitle = 'Talebi Reddet';
      this.modalPlaceholder = 'Lütfen ret sebebini belirtin...';
    } else if (action === 'revision') {
      this.modalTitle = 'Revizyon İste';
      this.modalPlaceholder = 'Düzeltilmesi gerekenler...';
    } else {
      this.modalTitle = 'Eğitimi Onayla';
      this.modalPlaceholder = 'Not (Opsiyonel)';
    }

    const modalEl = document.getElementById('actionModal');
    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
  }

  submitDecision() {
    if (!this.selectedRequest) return;
    if ((this.modalAction === 'reject' || this.modalAction === 'revision') && !this.adminNote.trim()) {
      this.toastr.warning('Lütfen bir açıklama girin.');
      return;
    }

    this.isProcessing = true;
    let decisionId = 1;
    if (this.modalAction === 'reject') decisionId = 2;
    if (this.modalAction === 'revision') decisionId = 3;
    
    const dto = {
      requestId: this.selectedRequest.id,
      decision: decisionId,
      adminNote: this.adminNote
    };

    this.processService.respondToRequest(dto).subscribe({
      next: (res) => {
        this.isProcessing = false;
        if (res.header.result) {
          this.toastr.success(res.body.message || 'İşlem tamamlandı.');
          const actionModalEl = document.getElementById('actionModal');
          if (actionModalEl) {
            const modal = bootstrap.Modal.getInstance(actionModalEl);
            if (modal) modal.hide();
          }
          this.loadData();
        } else {
          this.toastr.warning(res.header.message);
        }
      },
      error: () => {
        this.isProcessing = false;
        this.toastr.error('Hata oluştu.');
      }
    });
  }
}