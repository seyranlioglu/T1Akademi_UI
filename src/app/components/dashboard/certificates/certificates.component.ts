import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CertificateApiService } from 'src/app/shared/api/certificate-api.service';
import { ExamApiService } from 'src/app/shared/api/exam-api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-certificates',
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.scss']
})
export class CertificatesComponent implements OnInit, OnDestroy {
  activeTab: 'certificates' | 'exams' = 'certificates';
  
  certificates: any[] = [];
  examHistory: any[] = [];
  
  isLoadingCerts: boolean = true;
  isLoadingExams: boolean = true;

  private subs: Subscription = new Subscription();

  constructor(
    private certApi: CertificateApiService,
    private examApi: ExamApiService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadCertificates();
    this.loadExamHistory();
  }

  setTab(tab: 'certificates' | 'exams') {
    this.activeTab = tab;
  }

  loadCertificates() {
    this.isLoadingCerts = true;
    this.subs.add(
      this.certApi.getMyCertificates().subscribe({
        next: (res: any) => {
          this.certificates = res.body || res.data || res || [];
          this.isLoadingCerts = false;
        },
        error: () => {
          this.toastr.error('Sertifikalar yüklenemedi.');
          this.isLoadingCerts = false;
        }
      })
    );
  }

  loadExamHistory() {
    this.isLoadingExams = true;
    this.subs.add(
      this.examApi.getMyExamHistory().subscribe({
        next: (res: any) => {
          this.examHistory = res.body || res.data || res || [];
          this.isLoadingExams = false;
        },
        error: () => {
          this.toastr.error('Sınav geçmişi yüklenemedi.');
          this.isLoadingExams = false;
        }
      })
    );
  }

  openCertificate(url: string | null) {
    if (!url) {
      this.toastr.warning('Sertifika dosyası henüz oluşturulmamış veya bulunamıyor.');
      return;
    }
    // PDF'i yeni sekmede açar
    window.open(url, '_blank');
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}