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
  
  // Navigasyon butonları için parent'a sinyal
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
    // İlk açılışta yükle
    if (this.userExamId || this.mode === 'preview') {
      this.loadQuestion();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Sıra değiştiğinde (Sidebar'dan veya İleri/Geri ile)
    if (changes['currentSeq'] && !changes['currentSeq'].firstChange) {
      this.loadQuestion();
    }
  }

  loadQuestion() {
    this.isLoading = true;
    this.questionData = null;
    this.selectedOptionId = null;

    // Backend'de "Sıradaki Soru" mantığı var.
    // Ancak rastgele erişim için backend'e 'currentSeq' göndererek o sıradaki soruyu istemeliyiz.
    // Şimdilik 'GetNextQuestion' metodunu 'GetQuestionBySeq' gibi kullanıyoruz (Backend desteği varsayımıyla).
    // Eğer backend sadece "next" destekliyorsa, burası için backend'e ufak bir revize gerekebilir.
    
    const payload = { 
        userExamId: this.userExamId, 
        currentQuestionSeqNum: this.currentSeq - 1 // Backend > gönderdiğimizden büyük olanı getiriyor olabilir, mantığı kontrol et
    };

    // NOT: Backend metodunu direkt kullanıyoruz, Preview için mock data dönebiliriz.
    // Preview modunda API çağrısı farklı olabilir veya frontend'de array'den çekebiliriz.
    // Şimdilik student modu üzerinden gidelim.
    
    this.examApi.getNextQuestion(payload).subscribe({
      next: (res) => {
        if (res.header.result) {
          this.questionData = res.body.currentQuestion;
          this.isLoading = false;
          
          // Eğer daha önce cevaplanmışsa, backend'den gelen datada selectedOptionId olmalı.
          // Mevcut DTO'da yoksa bunu eklememiz gerekecek.
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
    if (this.mode === 'preview') {
      this.selectedOptionId = optionId;
      return;
    }

    this.selectedOptionId = optionId;
    this.isSaving = true;

    // Auto-Save
    const payload = {
      userExamId: this.userExamId,
      questionId: this.questionData.id,
      selectedOptionId: optionId
    };

    this.examApi.submitAnswer(payload).subscribe({
      next: (res) => {
        this.isSaving = false;
        // Sidebar'daki durumu güncellemek için parent'a haber verebiliriz
      },
      error: () => {
        this.isSaving = false;
        this.toastr.warning('Cevap kaydedilemedi, tekrar deneyin.');
      }
    });
  }
}