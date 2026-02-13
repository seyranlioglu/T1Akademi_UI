import { Component, OnInit } from '@angular/core';
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

  // Modal ve İnceleme Verileri
  selectedRequest: any = null;
  selectedTrainingDetail: any = null; // Admin incelemesi için full detay
  
  // Aksiyon Değişkenleri
  modalAction: 'approve' | 'reject' | 'revision' = 'approve';
  modalTitle: string = '';
  modalPlaceholder: string = '';
  adminNote: string = '';
  isProcessing: boolean = false;

  constructor(
    private processService: TrainingProcessService,
    private trainingService: TrainingApiService, // Detay çekmek için
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    // ProcessService muhtemelen raw response dönüyor (header/body), burası doğru kalabilir.
    // Eğer ProcessService de pipe/map kullanıyorsa burayı da düzeltmemiz gerekebilir.
    // Şimdilik hata burayı işaret etmediği için dokunmuyorum.
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

  // 🔍 1. İNCELEME MODALINI AÇ (Detayları Getir)
  openReviewModal(request: any) {
    this.selectedRequest = request;
    this.selectedTrainingDetail = null;
    
    // DÜZELTME: TrainingService zaten 'body'yi ayıklayıp dönüyor.
    // 'res' direkt olarak eğitim verisidir (GetTrainingDto).
    this.trainingService.getTrainingById(request.trainingId).subscribe({
      next: (res: any) => {
        if(res) {
          this.selectedTrainingDetail = res;
          
          // Modalı Aç
          const modalEl = document.getElementById('reviewModal');
          if (modalEl) {
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
          }
        }
      },
      error: () => {
        this.toastr.error("Eğitim detayları yüklenemedi.");
      }
    });
  }

  // 🛑 2. AKSİYON MODALINI AÇ (Ret veya Revizyon için)
  openActionModal(action: 'approve' | 'reject' | 'revision') {
    this.modalAction = action;
    this.adminNote = '';

    if (action === 'reject') {
      this.modalTitle = 'Talebi Reddet';
      this.modalPlaceholder = 'Lütfen ret sebebini belirtin (Örn: Politika ihlali, yetersiz içerik)...';
    } else if (action === 'revision') {
      this.modalTitle = 'Revizyon İste';
      this.modalPlaceholder = 'Hangi kısımların düzeltilmesi gerektiğini detaylıca yazın (Örn: Ses kalitesi düşük, kapak resmi hatalı)...';
    } else {
      // Onay ise direkt modalı aç (Not opsiyonel olabilir)
      this.modalTitle = 'Eğitimi Onayla';
      this.modalPlaceholder = 'Eğitmene iletmek istediğiniz bir not var mı? (Opsiyonel)';
    }

    const actionModalEl = document.getElementById('actionModal');
    if (actionModalEl) {
        const modal = new bootstrap.Modal(actionModalEl);
        modal.show();
    }
  }

  // 📝 3. KARARI GÖNDER
  submitDecision() {
    if (!this.selectedRequest) return;

    // Ret veya Revizyon ise not zorunlu
    if ((this.modalAction === 'reject' || this.modalAction === 'revision') && !this.adminNote.trim()) {
      this.toastr.warning('Lütfen bir açıklama girin.');
      return;
    }

    this.isProcessing = true;

    // Enum Mapping: Approve=1, Reject=2, Revision=3
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
        // ProcessService muhtemelen raw response dönüyor
        if (res.header.result) {
          this.toastr.success(res.body.message || 'İşlem başarıyla tamamlandı.');
          
          // Modalları kapat
          const actionModalEl = document.getElementById('actionModal');
          if (actionModalEl) {
            const actionModal = bootstrap.Modal.getInstance(actionModalEl);
            if (actionModal) actionModal.hide();
          }

          const reviewModalEl = document.getElementById('reviewModal');
          if (reviewModalEl) {
            const reviewModal = bootstrap.Modal.getInstance(reviewModalEl);
            if (reviewModal) reviewModal.hide();
          }

          this.loadData(); // Listeyi yenile
        } else {
          this.toastr.warning(res.header.message);
        }
      },
      error: (err) => {
        this.isProcessing = false;
        this.toastr.error('İşlem sırasında hata oluştu.');
      }
    });
  }

  // Helper: Video Oynat (Mock)
  playVideo(content: any) {
    if(content.trainingContentLibraryDto?.trainingContentLibraryFilePath) {
        window.open(content.trainingContentLibraryDto.trainingContentLibraryFilePath, '_blank');
    } else {
        this.toastr.info("Video dosyası bulunamadı veya henüz işleniyor.");
    }
  }
}