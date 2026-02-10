import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExamApiService } from 'src/app/shared/api/exam-api.service';
// ExamBuilder'ın yolunu kendi projene göre ayarla
import { ExamBuilderComponent } from '../../pages/instructor/course-manage/curriculum/exam-builder/exam-builder.component';

export interface ExamSummary {
  examId: number;
  title: string;
  status: string;
  topicCount?: number;
  questionCount?: number;
  description?: string;
  successRate?: number;
}

@Component({
  selector: 'app-exam-selector',
  templateUrl: './exam-selector.component.html',
  styleUrls: ['./exam-selector.component.scss'],
  standalone: false
})
export class ExamSelectorComponent implements OnInit {

  @Input() selectedExamId: number | null = null; // Dışarıdan gelen seçili ID
  @Input() disabled: boolean = false;
  @Input() label: string = 'Sınav Seçimi';
  
  // Sadece ID değil, tüm objeyi dönüyoruz ki parent component kullansın
  @Output() onExamSelect = new EventEmitter<ExamSummary>(); 

  exams: ExamSummary[] = [];
  selectedExam: ExamSummary | null = null;
  isLoading = false;

  constructor(
    private examApi: ExamApiService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.loadExams();
  }

  loadExams(autoSelectId: number | null = null) {
    this.isLoading = true;
    // Backend'deki Lookup servisini çağırıyoruz
    // NOT: Backend'deki GetExamListForLookupResponse DTO'suna QuestionCount ve TopicCount eklenmeli.
    this.examApi.getExamListForLookup({ isActive: true }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.header?.result) {
          this.exams = res.body?.exams || [];
          
          // Eğer bir ID ile geldiyse (Edit mode) veya yeni sınav oluşturulduysa onu seç
          const targetId = autoSelectId || this.selectedExamId;
          if (targetId) {
            this.setSelection(targetId);
          }
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  // Dropdown değişince çalışır
  onChange(event: any) {
    const val = Number(event.target.value);
    this.setSelection(val);
  }

  // Seçimi ayarlar ve dışarıya emit eder
  setSelection(id: number) {
    const found = this.exams.find(e => e.examId === id);
    if (found) {
      this.selectedExamId = id;
      this.selectedExam = found;
      this.onExamSelect.emit(found); // Tüm objeyi fırlat
    }
  }

  // --- İŞLEMLER ---

  // 1. Yeni Sınav Oluşturma
  openNewExamModal() {
    const modalRef = this.modalService.open(ExamBuilderComponent, { 
      size: 'xl', 
      centered: true, 
      backdrop: 'static',
      keyboard: false
    });

    // Modal kapandığında dönen examId'yi yakala
    modalRef.result.then((resultExamId) => {
      if (resultExamId && resultExamId > 0) {
        // Listeyi yenile ve yeni sınavı otomatik seç
        this.loadExams(resultExamId);
      }
    }, () => { }); // Dismiss
  }

  // 2. Önizleme / Detay Görme
  openPreview() {
    if (!this.selectedExamId) return;

    const modalRef = this.modalService.open(ExamBuilderComponent, { 
      size: 'xl', 
      centered: true, 
      backdrop: 'static'
    });

    // Input olarak ID'yi veriyoruz ki dolu gelsin
    modalRef.componentInstance.examId = this.selectedExamId;

    // Modal kapanınca (belki düzenleme yapmıştır) listeyi tazeleyelim mi?
    // Kullanıcı deneyimi için tazelemek iyidir, isim vs değişmiş olabilir.
    modalRef.result.then((result) => {
        // Eğer true döndüyse bir güncelleme olmuştur
        if (result === true) {
            this.loadExams(this.selectedExamId);
        }
    }, () => {});
  }
}