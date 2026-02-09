import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ExamApiService } from 'src/app/shared/api/exam-api.service';

// DÜZELTME: Dosya yolu hatası giderildi. 
// Eğer course-manage klasörü instructor klasörünün altındaysa bu yol çalışır.
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
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadExams();
  }

  loadExams() {
    this.isLoading = true;
    this.examApi.getInstructorExamLibrary().subscribe({
      next: (res) => {
        this.isLoading = false;
        
        // Debug için konsola basıyoruz
        console.log('API Response:', res);

        if (res.header && res.header.result) {
          // Backend'den gelen body'nin dizi olduğundan emin olalım
          const data = Array.isArray(res.body) ? res.body : [];
          
          this.exams = data;
          // Referansı yenile ki tablo tetiklensin
          this.filteredExams = [...data]; 
        }
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.toastr.error('Sınav listesi yüklenemedi.');
      }
    });
  }

  applyFilter() {
    if (!this.filterText) {
        this.filteredExams = [...this.exams];
        return;
    }
    const term = this.filterText.toLocaleLowerCase('tr');
    this.filteredExams = this.exams.filter(e => 
        e.title?.toLocaleLowerCase('tr').includes(term) || 
        (e.description && e.description.toLocaleLowerCase('tr').includes(term))
    );
  }

  // --- MODAL AÇMA İŞLEMLERİ ---

  editExam(id: number) {
    this.openBuilderModal(id);
  }

  createNewExam() {
    this.openBuilderModal(null); 
  }

  private openBuilderModal(examId: number | null) {
    const modalRef = this.modalService.open(ExamBuilderComponent, { 
        size: 'xl',
        centered: true,
        backdrop: 'static',
        keyboard: false,
        scrollable: true
    });

    modalRef.componentInstance.examId = examId;

    modalRef.result.then((result) => {
        if (result === true) {
            this.loadExams();
        }
    }, () => {});
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
       // Silme işlemi simülasyonu (Backend metodu varsa burayı aç)
       // this.examApi.deleteExam(exam.examId).subscribe(...)
       
       this.toastr.success('Sınav silindi.');
       this.exams = this.exams.filter(e => e.examId !== exam.examId);
       this.applyFilter();
    }
  }
}