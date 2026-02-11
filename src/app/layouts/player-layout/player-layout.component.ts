import { Component, OnInit, OnDestroy, ViewEncapsulation, HostListener, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { Subject, combineLatest, interval, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { LogApiService } from 'src/app/shared/api/log-api.service';
import { GetTraining, TrainingContentDto, ActiveContentResumeDto } from 'src/app/shared/models/get-training.model';

@Component({
  selector: 'app-player-layout',
  templateUrl: './player-layout.component.html',
  styleUrls: ['./player-layout.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PlayerLayoutComponent implements OnInit, OnDestroy {

  @ViewChild('videoPlayer') videoPlayerRef!: ElementRef<HTMLVideoElement>;

  // Temel Değişkenler
  courseId!: number;
  previewToken: string | null = null;
  isPreviewMode: boolean = false;

  course: GetTraining | null = null;
  currentContent: any | null = null; 
  
  // Yükleme Durumları
  isLoading: boolean = true;        
  isContentLoading: boolean = false; 

  // Resume & Log
  resumeContext: ActiveContentResumeDto | null = null;
  heartbeatSubscription: Subscription | null = null;
  lastLoggedSecond: number = 0;

  // UI State
  isSidebarOpen: boolean = true;
  openSections: { [key: number]: boolean } = {};
  activeTab: string = 'overview';
  viewType: 'video' | 'youtube' | 'image' | 'pdf' | 'exam' | 'unknown' = 'unknown';

  // 🔥 SINAV MODAL KONTROLÜ
  isExamRunnerVisible: boolean = false;
  activeExamId: number = 0;

  // PDF Modalı
  isPdfModalOpen: boolean = false;
  pdfSrc: any;
  currentPdfPage: number = 1;
  totalPdfPages: number = 0;
  
  // Timer
  timerInterval: any;
  timeRemaining: number = 0;
  elapsedTime: number = 0;
  totalPageTime: number = 0; 
  isTimerGreen: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private trainingApi: TrainingApiService,
    private logApi: LogApiService,
    private sanitizer: DomSanitizer,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    combineLatest([this.route.params, this.route.queryParams])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([params, queryParams]) => {
        const id = params['id'];
        this.previewToken = queryParams['previewToken'];

        if (id) {
          this.courseId = +id;
          if (this.previewToken) {
            this.isPreviewMode = true;
            this.showPreviewNotification();
          }
          this.loadCourseData();
        }
      });
  }

  ngOnDestroy(): void {
    this.sendBeaconLog();
    this.destroy$.next();
    this.destroy$.complete();
    this.stopTimer();
    this.stopHeartbeat();
  }

  @HostListener('window:beforeunload')
  onBeforeUnload() {
    this.sendBeaconLog();
  }

  showPreviewNotification() {
    if (!sessionStorage.getItem('preview_toast_shown')) {
      setTimeout(() => {
        this.toastr.warning('Eğitmen Önizleme Modundasınız.', 'Bilgi', { timeOut: 3000 });
        sessionStorage.setItem('preview_toast_shown', 'true');
      }, 1000);
    }
  }

  loadCourseData() {
    this.isLoading = true;
    this.trainingApi.getTrainingById(this.courseId, this.previewToken || undefined).subscribe({
      next: (res: any) => {
        this.course = res.data || res;
        this.resumeContext = this.course?.resumeContext || null;
        this.initPlayer();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error("Kurs yüklenirken hata:", err);
        this.toastr.error('Eğitim yüklenemedi.');
        this.isLoading = false;
      }
    });
  }

  initPlayer() {
    if (!this.course?.trainingSections?.length) return;

    // Sıralama
    this.course.trainingSections.sort((a, b) => (a.trainingSectionRowNumber || 0) - (b.trainingSectionRowNumber || 0));
    this.course.trainingSections.forEach(section => {
        if(section.trainingContents) section.trainingContents.sort((a, b) => (a.orderId || 0) - (b.orderId || 0));
    });

    let targetId: number | undefined;

    // Resume varsa
    if (this.resumeContext && this.resumeContext.contentId > 0) {
        targetId = this.resumeContext.contentId;
        if (this.resumeContext.sectionId) this.openSections[this.resumeContext.sectionId] = true;
    }
    // Yoksa ilk ders
    else {
        const firstSection = this.course.trainingSections[0];
        if (firstSection.trainingSectionId) this.openSections[firstSection.trainingSectionId] = true;
        if (firstSection.trainingContents?.length) targetId = firstSection.trainingContents[0].id;
    }

    if (targetId) {
        this.loadAndPlayContent(targetId, 'Resume');
    }
  }

  onSidebarClick(content: TrainingContentDto) {
      if (content.isLocked && !this.isPreviewMode) {
          this.toastr.warning('Önceki dersleri tamamlamalısınız.', 'Kilitli İçerik');
          return;
      }
      
      // Eğer tıklanan içerik zaten açıksa ve sınav değilse işlem yapma
      // (Sınav ise her tıklamada açmak isteyebiliriz, belki kapattı yanlışlıkla)
      if (this.currentContent?.id === content.id && this.viewType !== 'exam') return;

      this.loadAndPlayContent(content.id, 'Manual');
  }

  // ===========================================================================
  // 🔥 OYNATMA MOTORU
  // ===========================================================================
  loadAndPlayContent(targetId?: number, triggerType: string = 'Manual') {
      
      if (this.currentContent) {
          this.sendBeaconLog();
          this.stopHeartbeat();
      }

      this.isContentLoading = true;
      this.pdfSrc = null; 
      this.isExamRunnerVisible = false; // Sınav modalını kapat (eğer açıksa)

      const payload = {
          trainingId: this.courseId,
          currentContentId: this.currentContent?.id,
          targetContentId: targetId,
          previewToken: this.previewToken 
      };

      if (triggerType === 'AutoNext' && !targetId) {
          delete payload.targetContentId;
      }

      this.trainingApi.getContent(payload).subscribe({
          next: (res: any) => {
              this.isContentLoading = false;

              if (res.data?.isTrainingFinished) {
                  this.toastr.success(res.data.message || 'Tebrikler! Eğitimi tamamladınız.');
                  return;
              }

              const playableContent = res.body?.content || res.data?.content || res.content || res;

              if (playableContent) {
                  this.currentContent = playableContent;
                  this.updateSidebarActiveState(playableContent.id);
                  this.detectViewType(); // Türü belirle (Video, PDF, Sınav)
                  
                  // 🔥 SINAV KONTROLÜ
                  if (this.viewType === 'exam') {
                      this.startExamSession(playableContent);
                  } else {
                      this.setupPlayerAfterFetch();
                  }
              }
          },
          error: (err: any) => {
              this.isContentLoading = false;
              if (err.status === 403) {
                  this.toastr.warning(err.error?.message || 'Bu içeriğe erişim izniniz yok.', 'Erişim Engellendi');
              } else {
                  this.toastr.error('İçerik yüklenemedi.');
              }
          }
      });
  }

  setupPlayerAfterFetch() {
      if (this.viewType === 'pdf') {
          this.isPdfModalOpen = false;
          this.pdfSrc = this.getFileUrl();
          this.resetTimer();
          this.startHeartbeat();
      }
      else if (this.viewType === 'video' || this.viewType === 'youtube') {
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      }
      else {
          this.startHeartbeat();
      }
  }

  // ===========================================================================
  // 🔥 SINAV İŞLEMLERİ
  // ===========================================================================
  startExamSession(content: any) {
      // Content'in içinde examId olmalı. Backend DTO'sunda "examId" alanı var mı kontrol et.
      if (content.examId) {
          this.activeExamId = content.examId;
          this.isExamRunnerVisible = true;
          // Sınav başladığında loglama yapabiliriz ("Started")
          this.logProgress('StartExam'); 
      } else {
          this.toastr.error("Sınav verisi eksik.");
      }
  }

    onExamClosed(event: any) {
        const isFinished = event as boolean; // Tip güvenliği için cast edelim
        
        this.isExamRunnerVisible = false;
        this.activeExamId = 0;

        if (isFinished) {
            this.logProgress('Complete');
            if (this.currentContent) { // Null check
                this.updateSidebarStatus(this.currentContent.id, true);
            }
            this.toastr.success('Sınav tamamlandı. Sonraki derse geçiliyor...');
            setTimeout(() => this.loadAndPlayContent(undefined, 'AutoNext'), 1500);
        } else {
            this.toastr.info("Sınavdan çıkıldı.");
        }
    }

  // ===========================================================================
  // 3. LOGLAMA
  // ===========================================================================
  startHeartbeat() {
    this.stopHeartbeat();
    if (this.isPreviewMode) return; 

    this.heartbeatSubscription = interval(10000).subscribe(() => {
        this.logProgress('Heartbeat');
    });
  }

  stopHeartbeat() {
    if (this.heartbeatSubscription) {
        this.heartbeatSubscription.unsubscribe();
        this.heartbeatSubscription = null;
    }
  }

  logProgress(action: string, seekFrom?: number) {
    if (!this.currentContent || this.isPreviewMode) return;

    let currentSecond = 0;
    let totalDuration = 0;

    if (this.viewType === 'video' && this.videoPlayerRef?.nativeElement) {
        try {
            currentSecond = Math.floor(this.videoPlayerRef.nativeElement.currentTime);
            totalDuration = Math.floor(this.videoPlayerRef.nativeElement.duration || 0);
        } catch(e) {}
    } 
    else if (this.viewType === 'pdf' || this.viewType === 'image') {
        currentSecond = this.elapsedTime;
        totalDuration = this.totalPageTime || 60; 
    }

    const payload = {
        trainingContentId: this.currentContent.id,
        currentSecond: currentSecond,
        totalDuration: totalDuration,
        action: action,
        seekFrom: seekFrom
    };

    this.logApi.logProgress(payload).subscribe({
        next: (res) => {
            this.lastLoggedSecond = currentSecond;
            if (res.result && action === 'Complete') {
                this.updateSidebarStatus(this.currentContent!.id, true);
            }
        },
        error: (err: any) => console.error("Log hatası:", err)
    });
  }

  sendBeaconLog() {
    if (!this.currentContent || this.isPreviewMode) return;
    
    let currentSecond = 0;
    if (this.viewType === 'video' && this.videoPlayerRef?.nativeElement) {
        currentSecond = Math.floor(this.videoPlayerRef.nativeElement.currentTime);
    } else {
        currentSecond = this.elapsedTime;
    }

    const payload = {
        trainingContentId: this.currentContent.id,
        currentSecond: currentSecond,
        totalDuration: 0, 
        action: 'Heartbeat' 
    };

    this.logApi.logProgressBeacon(payload);
  }

  // ===========================================================================
  // 4. VIDEO EVENTLERİ
  // ===========================================================================
  onVideoLoadedMetadata() {
    if (this.resumeContext && this.currentContent?.id === this.resumeContext.contentId) {
        if (this.videoPlayerRef?.nativeElement && this.resumeContext.lastWatchedSecond > 0) {
            this.videoPlayerRef.nativeElement.currentTime = this.resumeContext.lastWatchedSecond;
            this.resumeContext = null; 
        }
    }
  }

  onVideoPlay() { this.startHeartbeat(); this.logProgress('Play'); }
  onVideoPause() { this.stopHeartbeat(); this.logProgress('Pause'); }
  onVideoSeeked() { this.logProgress('Seek'); }
  
  onVideoEnded() {
    this.stopHeartbeat();
    this.logProgress('Complete');
    this.toastr.success('Ders tamamlandı. Sonrakine geçiliyor...');
    setTimeout(() => this.loadAndPlayContent(undefined, 'AutoNext'), 2000);
  }

  // ===========================================================================
  // HELPER / UI METOTLARI
  // ===========================================================================
  
  getFileUrl(): string {
    return this.currentContent?.filePath || 
           this.currentContent?.trainingContentLibraryDto?.trainingContentLibraryFilePath || 
           '';
  }

  detectViewType() {
    if (!this.currentContent) { this.viewType = 'unknown'; return; }
    
    // 🔥 SINAV TESPİTİ
    // Backend 'contentType.code' = 'exm' veya title='exam' dönebilir.
    // Önceki kodlarında 'exm' kullanmıştık.
    const typeCode = this.currentContent.contentType?.code?.toLowerCase() || '';
    const typeTitle = this.currentContent.contentType?.title?.toLowerCase() || '';

    if (typeCode === 'exm' || typeTitle === 'exam' || this.currentContent.examId) {
        this.viewType = 'exam';
        return;
    }

    const url = this.getFileUrl().toLowerCase();
    
    // 1. YouTube
    if (typeTitle === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
        this.viewType = 'youtube';
    }
    // 2. PDF
    else if (url.endsWith('.pdf') || typeTitle === 'document') {
        this.viewType = 'pdf';
    }
    // 3. Video
    else if (typeTitle === 'lecture' || typeTitle === 'video' || url.match(/\.(mp4|webm|ogg|mov)$/)) {
        this.viewType = 'video';
    }
    // 4. Image
    else if (url.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        this.viewType = 'image';
    }
    else {
        if (url.includes('.mp4')) this.viewType = 'video';
        else this.viewType = 'unknown';
    }
  }

  getYoutubeEmbedUrl(content: any): SafeResourceUrl {
    const url = this.getFileUrl(); 
    if (!url) return '';
    let videoId = '';
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (match && match[1]) videoId = match[1];
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`);
  }

  updateSidebarStatus(contentId: number, isCompleted: boolean) {
      if (!this.course?.trainingSections) return;
      for (const section of this.course.trainingSections) {
          const content = section.trainingContents?.find(c => c.id === contentId);
          if (content) {
              content.isChecked = isCompleted;
              content.isLocked = false;
          }
      }
  }

  updateSidebarActiveState(activeId: number) {
      // UI Binding kullanıyor
  }

  getDuration(content: any): string { return content.time || ''; }
  getIconClass(content: any): string {
      let type = content.contentType?.title?.toLowerCase() || '';
      
      // İkonlar
      if (type === 'exam' || content.contentType?.code === 'exm') return 'bx-task text-warning'; // Sınav ikonu
      if(type==='video' || type==='lecture') return 'bx-video';
      if(type==='youtube') return 'bx-play-circle';
      if(type.includes('pdf') || type.includes('doc')) return 'bxs-file-pdf';
      return 'bx-file';
  }

  getNextLessonTitle(): string | null {
    if (!this.course?.trainingSections || !this.currentContent) return null;
    
    let foundCurrent = false;
    
    for (const section of this.course.trainingSections) {
        if (!section.trainingContents) continue;
        for (const content of section.trainingContents) {
            if (foundCurrent) {
                return content.title;
            }
            if (content.id === this.currentContent.id) {
                foundCurrent = true;
            }
        }
    }
    return null; 
  }
  
  toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; }
  toggleSection(id: number | undefined) { if(id !== undefined) this.openSections[id] = !this.openSections[id]; }
  setActiveTab(tab: string) { this.activeTab = tab; }
  formatTotalDuration(totalMinutes: any): string {
    if (!totalMinutes || totalMinutes <= 0) return '0 dk';
    const minutes = Math.ceil(totalMinutes);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) return `${minutes} dk`;
    else if (remainingMinutes === 0) return `${hours} saat`;
    else return `${hours} saat ${remainingMinutes} dk`;
  }

  // PDF Helpers
  openPdfModal() { this.isPdfModalOpen = true; this.setupTimer(10); this.startTimer(); }
  closePdfModal() { this.isPdfModalOpen = false; this.stopTimer(); }
  onPdfLoaded(event: any) { this.totalPdfPages = event.pagesCount; this.currentPdfPage = 1; }
  nextPdfPage() { if (this.currentPdfPage < this.totalPdfPages) this.currentPdfPage++; }
  prevPdfPage() { if (this.currentPdfPage > 1) this.currentPdfPage--; }
  setupTimer(s: number) { this.totalPageTime = s; this.timeRemaining = s; this.elapsedTime = 0; this.isTimerGreen = false; if(this.isPreviewMode) this.isTimerGreen=true; }
  stopTimer() { if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; } }
  resetTimer() { this.stopTimer(); this.elapsedTime = 0; this.timeRemaining = 0; this.isTimerGreen = false; }
  startTimer() {
      this.stopTimer(); if (this.isPreviewMode) return;
      this.timerInterval = setInterval(() => {
          if (this.timeRemaining > 0) { this.timeRemaining--; this.elapsedTime++; }
          else { this.isTimerGreen = true; this.stopTimer(); this.toastr.success('Okuma süresi tamamlandı.'); this.logProgress('Complete'); }
      }, 1000);
  }
}