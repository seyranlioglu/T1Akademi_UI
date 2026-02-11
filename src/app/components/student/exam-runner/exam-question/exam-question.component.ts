import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ExamApiService } from 'src/app/shared/api/exam-api.service';

@Component({
  selector: 'app-exam-question',
  templateUrl: './exam-question.component.html',
  styleUrls: ['./exam-question.component.scss'],
  standalone: false
})
export class ExamQuestionComponent implements OnInit, OnChanges {

  @Input() userExamId!: number;
  @Input() currentSeq: number = 1;
  @Input() mode: 'student' | 'preview' = 'student';
  
  // 🔥 YENİ INPUTLAR
  @Input() previewToken: string | null = null;
  @Input() examId?: number; 
  @Input() targetQuestionId?: number;

  @Output() next = new EventEmitter<void>();
  @Output() prev = new EventEmitter<void>();

  isLoading: boolean = false;
  questionData: any = null;
  selectedOptionId: number | null = null;
  isSaving: boolean = false;

  constructor(
    private examApi: ExamApiService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    if (this.userExamId || (this.mode === 'preview' && this.examId)) {
      this.loadQuestion();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentSeq'] && !changes['currentSeq'].firstChange) {
      this.loadQuestion();
    }
  }

  loadQuestion() {
    this.isLoading = true;
    this.questionData = null;
    this.selectedOptionId = null;

    // 🔥 PAYLOAD GÜNCELLEMESİ
    const payload = { 
        userExamId: this.userExamId || 0,
        currentQuestionSeqNum: this.currentSeq - 1, // 0-based index
        targetQuestionId: this.targetQuestionId,
        previewToken: this.previewToken,
        examId: this.examId 
    };

    this.examApi.getNextQuestion(payload).subscribe({
      next: (res) => {
        if (res.header.result) {
          
          if (res.body.isCompleted) {
             this.toastr.info(res.body.examEndMessage || 'Sorular bitti.');
             this.isLoading = false;
             return;
          }

          this.questionData = res.body.currentQuestion;
          
          // 🔥 CEVAP BINDING: Öğrencinin önceki cevabını seçili getir
          if (this.questionData.selectedOptionId && this.questionData.selectedOptionId > 0) {
              this.selectedOptionId = this.questionData.selectedOptionId;
          }

          this.isLoading = false;
        } else {
          this.toastr.error('Soru yüklenemedi.');
          this.isLoading = false;
        }
      },
      error: () => {
        this.toastr.error('Bağlantı hatası.');
        this.isLoading = false;
      }
    });
  }

  onOptionSelect(optionId: number) {
    this.selectedOptionId = optionId;

    if (this.mode === 'preview') {
      return; // Preview'da kaydetme yok
    }

    this.isSaving = true;

    const payload = {
      userExamId: this.userExamId,
      questionId: this.questionData.id,
      selectedOptionId: optionId
    };

    this.examApi.submitAnswer(payload).subscribe({
      next: (res) => {
        this.isSaving = false;
      },
      error: () => {
        this.isSaving = false;
        this.toastr.warning('Cevap kaydedilemedi.');
      }
    });
  }
}