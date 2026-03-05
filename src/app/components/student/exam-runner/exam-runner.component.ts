import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Subject, takeUntil, timer } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { ExamApiService } from 'src/app/shared/api/exam-api.service';
import { ExamSecurityService } from 'src/app/shared/services/exam-security.service';
import { ExamSidebarComponent } from './exam-sidebar/exam-sidebar.component';

@Component({
  selector: 'app-exam-runner',
  templateUrl: './exam-runner.component.html',
  styleUrls: ['./exam-runner.component.scss'],
  standalone: false
})
export class ExamRunnerComponent implements OnInit, OnDestroy {

  @ViewChild(ExamSidebarComponent) sidebar!: ExamSidebarComponent;

  @Input() examId!: number;
  @Input() mode: 'student' | 'preview' = 'student';
  @Input() isLastContent: boolean = false; 

  @Output() closeExam = new EventEmitter<boolean>();

  previewToken: string | null = null;
  isLoading: boolean = true;
  isExamStarted: boolean = false;
  showResultScreen: boolean = false; 
  examResult: any = null; 
  examContext: any = null; 
  
  timeLeft: number = 0;
  timerDisplay: string = "00:00:00";
  private destroy$ = new Subject<void>();
  
  currentQuestionSeq: number = 1;
  totalQuestions: number = 0;

  constructor(
    private examApi: ExamApiService,
    private securityService: ExamSecurityService,
    private toastr: ToastrService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.previewToken = params['previewToken'] || null;
      if (this.previewToken) {
        this.mode = 'preview';
      }

      if (this.examId) {
        this.initializeExam(); // 🔥 API İSTEĞİ GERİ GELDİ
      } else {
        this.toastr.error("Sınav ID'si bulunamadı.");
        this.closeExam.emit(false);
      }
    });

    this.securityService.onViolation.subscribe(msg => this.toastr.warning(msg));
    this.securityService.onTerminate.subscribe(() => {
        this.toastr.error('Sınav sonlandırıldı.');
        this.finishExam(true); 
    });
  }

  // 🔥 SINAV BİLGİLERİNİ BACKEND'DEN ÇEKEN ASIL METOT (GERİ GELDİ)
  initializeExam() {
    this.isLoading = true;

    if (this.mode === 'preview') {
      this.examApi.previewExam(this.examId).subscribe({
        next: (res) => {
            if(res.header.result) {
                this.setupExamEnvironment(res.body);
                this.toastr.info('Önizleme modu aktif.');
            } else this.handleError("Veri alınamadı");
        },
        error: () => this.handleError("Hata oluştu")
      });
    } else {
      const payload = { examId: this.examId };
      this.examApi.prePrepareExamForStudent(payload).subscribe({
        next: (res) => {
            if(res.header.result) {
                this.setupExamEnvironment(res.body);
            } else this.handleError(res.header.msg);
        },
        error: () => this.handleError("Sunucu hatası")
      });
    }
  }

  setupExamEnvironment(data: any) {
    this.examContext = data;
    this.totalQuestions = data.totalQuestionCount || 0;
    this.isLoading = false;
  }

  startExamNow() {
    this.isExamStarted = true;
    if (this.mode === 'student') {
        this.securityService.startSecurity();
    }
    
    if (this.examContext?.examTime) {
      this.startTimer(this.examContext.examTime);
    }
  }

  startTimer(durationStr: string) {
    const parts = durationStr.split(':');
    const secondsTotal = (+parts[0] * 3600) + (+parts[1] * 60) + (+parts[2] || 0);
    this.timeLeft = secondsTotal;

    timer(0, 1000).pipe(takeUntil(this.destroy$)).subscribe(() => {
        if (this.timeLeft > 0) {
            this.timeLeft--;
            this.formatTime();
        } else {
            this.timeIsUp();
        }
    });
  }

  formatTime() {
    const h = Math.floor(this.timeLeft / 3600);
    const m = Math.floor((this.timeLeft % 3600) / 60);
    const s = this.timeLeft % 60;
    this.timerDisplay = `${this.pad(h)}:${this.pad(m)}:${this.pad(s)}`;
  }
  
  pad(val: number) { return val < 10 ? '0' + val : val; }

  timeIsUp() {
    this.toastr.warning('Süre doldu.');
    this.finishExam(true);
  }

  onQuestionChanged(seqNumber: number) {
    if (seqNumber < 1 || seqNumber > this.totalQuestions) return;
    this.currentQuestionSeq = seqNumber;
  }

  onAnswerSaved() {
    if (this.sidebar) {
      this.sidebar.setQuestionAnswered(this.currentQuestionSeq);
    }
  }

  finishExam(autoSubmit: boolean = false) {
    if (!autoSubmit && !confirm('Sınavı bitirmek istiyor musunuz?')) return;

    this.isLoading = true;

    const payload = { 
        userExamId: this.examContext?.userExamId || 0,
        previewToken: this.previewToken,
        examId: this.mode === 'preview' ? this.examId : undefined 
    };

    this.examApi.calculateExamResult(payload).subscribe({
        next: (res) => {
            this.isLoading = false;
            if (res.header.result) {
                this.examResult = res.body; 
                this.showResultScreen = true; 
                this.securityService.stopSecurity(); 
            } else {
                this.toastr.error('Sonuç hesaplanamadı.');
                this.exitRunner(false);
            }
        },
        error: () => {
            this.isLoading = false;
            this.toastr.error('Sunucu hatası.');
        }
    });
  }

  continueAfterExam() {
      this.exitRunner(true);
  }

  exitRunner(isFinished: boolean) {
    this.securityService.stopSecurity();
    this.closeExam.emit(isFinished);
  }

  handleError(msg: string) {
    this.toastr.error(msg);
    this.exitRunner(false);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.securityService.stopSecurity();
  }
}