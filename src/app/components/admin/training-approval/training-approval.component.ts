import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TrainingProcessService } from 'src/app/shared/api/training-process.service';

// Bootstrap modal'ı manuel tetiklemek için (Opsiyonel, data-bs-toggle ile de yapılabilir)
declare var bootstrap: any;

@Component({
  selector: 'app-training-approval',
  templateUrl: './training-approval.component.html',
  styleUrls: ['./training-approval.component.scss']
})
export class TrainingApprovalComponent implements OnInit {

  activeTab: string = 'trainings';
  isLoading: boolean = false;
  
  // Listeyi tutacak dizi
  pendingRequests: any[] = [];

  // Reddetme işlemi için geçici değişkenler
  selectedRequestId: number | null = null;
  rejectNote: string = '';
  isProcessing: boolean = false;

  constructor(
    private processService: TrainingProcessService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  changeTab(tabName: string) {
    this.activeTab = tabName;
    this.loadData(); // İleride farklı endpointler çağırılabilir
  }

  loadData() {
    this.isLoading = true;
    this.processService.getPendingRequests().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.header.result) {
          this.pendingRequests = res.body;
        } else {
          this.pendingRequests = [];
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error('Talepler yüklenirken hata oluştu.');
      }
    });
  }

  // ✅ HIZLI ONAY
  approveRequest(requestId: number) {
    if (!confirm('Bu eğitimi yayınlamak istediğinize emin misiniz?')) return;

    this.isProcessing = true;
    this.processService.respondToRequest(requestId, true).subscribe({
      next: (res) => {
        this.isProcessing = false;
        if (res.header.result) {
          this.toastr.success('Eğitim onaylandı ve yayına alındı.');
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

  // ❌ REDDETME MODALINI AÇ
  openRejectModal(requestId: number) {
    this.selectedRequestId = requestId;
    this.rejectNote = '';
    // HTML tarafında data-bs-toggle kullanacağız, manuel kod gerekmez
  }

  // ❌ REDDETME İŞLEMİNİ TAMAMLA
  confirmRejection() {
    if (!this.selectedRequestId) return;
    if (!this.rejectNote.trim()) {
      this.toastr.warning('Lütfen bir ret sebebi belirtin.');
      return;
    }

    this.isProcessing = true;
    this.processService.respondToRequest(this.selectedRequestId, false, this.rejectNote).subscribe({
      next: (res) => {
        this.isProcessing = false;
        if (res.header.result) {
          this.toastr.info('Talep reddedildi ve eğitmene bildirildi.');
          
          // Modalı Kapat (Bootstrap native)
          const modalEl = document.getElementById('rejectModal');
          const modal = bootstrap.Modal.getInstance(modalEl);
          modal.hide();

          this.loadData();
        }
      },
      error: (err) => {
        this.isProcessing = false;
        this.toastr.error('Hata oluştu.');
      }
    });
  }
}