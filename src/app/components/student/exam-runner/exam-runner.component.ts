import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, takeUntil, timer } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ExamApiService } from 'src/app/shared/api/exam-api.service';
import { ExamSecurityService } from 'src/app/shared/services/exam-security.service';

@Component({
  selector: 'app-exam-runner',
  templateUrl: './exam-runner.component.html',
  styleUrls: ['./exam-runner.component.scss'],
    standalone: false
})
export class ExamRunnerComponent implements OnInit, OnDestroy {

  // 🔥 URL yerine Input ile alıyoruz
  @Input() examId!: number;
  @Input() mode: 'student' | 'preview' = 'student';
  
  // 🔥 Sınav bitince veya çıkış yapılınca Parent'a haber veriyoruz
  @Output() closeExam = new EventEmitter<boolean>(); // true: sınav bitti (reload gerekebilir), false: iptal

  isLoading: boolean = true;
  examContext: any = null;
  timeLeft: number = 0;
  timerDisplay: string = "00:00:00";
  private destroy$ = new Subject<void>();
  
  currentQuestionSeq: number = 1;
  totalQuestions: number = 0;

  constructor(
    private examApi: ExamApiService,
    private securityService: ExamSecurityService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    if (this.examId) {
      this.initializeExam();
    } else {
      this.toastr.error("Sınav ID'si bulunamadı.");
      this.closeExam.emit(false);
    }

    // Güvenlik eventlerini dinle
    this.securityService.onViolation.subscribe(msg => this.toastr.warning(msg));
    this.securityService.onTerminate.subscribe(() => {
        this.toastr.error('Sınav sonlandırıldı.');
        this.finishExam(false); 
    });
  }

  initializeExam() {
    this.isLoading = true;
    if (this.mode === 'preview') {
      this.examApi.previewExam(this.examId).subscribe({
        next: (res) => {
            if(res.header.result) this.setupExamEnvironment(res.body);
            else this.handleError("Veri alınamadı");
        },
        error: () => this.handleError("Hata oluştu")
      });
    } else {
      const payload = { examId: this.examId };
      this.examApi.prePrepareExamForStudent(payload).subscribe({
        next: (res) => {
            if(res.header.result) {
                this.setupExamEnvironment(res.body);
                this.securityService.startSecurity(); // Güvenliği başlat
            } else this.handleError(res.header.msg);
        },
        error: () => this.handleError("Sunucu hatası")
      });
    }
  }

  setupExamEnvironment(data: any) {
    this.examContext = data;
    this.totalQuestions = data.totalQuestionCount;
    // Backend'den TimeSpan string "00:30:00" geldiğini varsayıyoruz
    if (data.examTime) this.startTimer(data.examTime);
    this.isLoading = false;
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

  finishExam(autoSubmit: boolean = false) {
    if (!autoSubmit && !confirm('Sınavı bitirmek istiyor musunuz?')) return;

    if (this.mode === 'preview') {
        this.exitRunner(true);
        return;
    }

    const payload = { userExamId: this.examContext.userExamId };
    this.examApi.calculateExamResult(payload).subscribe({
        next: () => {
            this.toastr.success('Sınav tamamlandı.');
            this.exitRunner(true); // true: Başarılı bitiş
        }
    });
  }

  exitRunner(isFinished: boolean) {
    this.securityService.stopSecurity();
    this.closeExam.emit(isFinished); // Parent'a "Ben kapandım" de.
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