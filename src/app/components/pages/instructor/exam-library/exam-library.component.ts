import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ExamApiService } from 'src/app/shared/api/exam-api.service';
// Builder Component'i import etmeyi unutma (Yol projene göre değişebilir)
import { ExamBuilderComponent } from '../course-manage/curriculum/exam-builder/exam-builder.component'; 

@Component({
  selector: 'app-exam-library',
  templateUrl: './exam-library.component.html',
  styleUrls: ['./exam-library.component.scss']
})
export class ExamLibraryComponent implements OnInit {
  
  exams: any[] = [];
  filteredExams: any[] = [];
  isLoading = false;
  filterText = '';
  
  selectedExamStats: any = null;

  constructor(
    private examApi: ExamApiService,
    private router: Router,
    private toastr: ToastrService,
    private modalService: NgbModal // Modal servisi inject edildi
  ) {}

  ngOnInit(): void {
    this.loadExams();
  }

  loadExams() {
    this.isLoading = true;
    this.examApi.getInstructorExamLibrary().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.result) {
          this.exams = res.body; 
          this.filteredExams = res.body;
        }
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Sınav listesi yüklenemedi.');
      }
    });
  }

  applyFilter() {
    const term = this.filterText.toLocaleLowerCase('tr');
    this.filteredExams = this.exams.filter(e => 
        e.title.toLocaleLowerCase('tr').includes(term) || 
        (e.description && e.description.toLocaleLowerCase('tr').includes(term))
    );
  }

  // --- MODAL AÇMA İŞLEMLERİ ---

  // 1. Düzenle (Edit)
  editExam(id: number) {
    this.openBuilderModal(id);
  }

  // 2. Yeni Sınav (Create)
  createNewExam() {
    this.openBuilderModal(null); // ID yok, create modu
  }

  // Ortak Modal Açıcı Metot
  private openBuilderModal(examId: number | null) {
    const modalRef = this.modalService.open(ExamBuilderComponent, { 
        size: 'xl',        // Ekstra Geniş Modal
        centered: true,    // Ortala
        backdrop: 'static',// Dışarı tıklayınca kapanmasın (veri kaybını önler)
        keyboard: false,   // ESC ile kapanmasın
        scrollable: true   // İçerik uzunsa scroll olsun
    });

    // Component'e ID'yi parametre olarak geçiyoruz
    modalRef.componentInstance.examId = examId;

    // Modal kapandığında ne olacak?
    modalRef.result.then((result) => {
        // Eğer component 'close(true)' ile kapandıysa, liste yenilensin
        if (result === true) {
            this.loadExams();
        }
    }, (dismiss) => {
        // Modal çarpıdan veya iptalden kapandıysa bir şey yapma
    });
  }

  // --- DİĞER AKSİYONLAR ---

  openStats(exam: any, content: any) {
    this.selectedExamStats = exam;
    this.modalService.open(content, { size: 'md', centered: true });
  }

  showUsages(exam: any) {
    if (exam.trainingCount > 0) {
      this.toastr.info(`Bu sınav ${exam.trainingCount} adet eğitimde kullanılıyor.`);
    } else {
      this.toastr.warning('Bu sınav henüz hiçbir eğitimde kullanılmıyor.');
    }
  }

  deleteExam(exam: any) {
    if (exam.isUsedInTraining) {
      this.toastr.error('Bu sınav aktif eğitimlerde kullanıldığı için silinemez!', 'Silme Engellendi');
      return;
    }

    if (confirm(`"${exam.title}" sınavını kalıcı olarak silmek istediğinize emin misiniz?`)) {
       // Backend entegrasyonu:
       // this.examApi.deleteExam(exam.examId).subscribe(...)
       
       this.toastr.success('Sınav silindi.');
       this.exams = this.exams.filter(e => e.examId !== exam.examId);
       this.applyFilter();
    }
  }
}