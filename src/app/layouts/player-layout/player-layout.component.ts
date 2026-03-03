import { Component, OnInit, OnDestroy, ViewEncapsulation, HostListener, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Location } from '@angular/common'; 
import { ToastrService } from 'ngx-toastr';
import { Subject, combineLatest, interval, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { LogApiService } from 'src/app/shared/api/log-api.service';
import { TrainingProcessService } from 'src/app/shared/api/training-process.service'; 
import { InstructorApiService } from 'src/app/shared/api/instructor-api.service'; 
import { TrainingQualityScoreApiService } from 'src/app/shared/api/training-quality-score-api.service';

import { GetTraining, TrainingContentDto, ActiveContentResumeDto, TrainingQualityScoreDto } from 'src/app/shared/models/get-training.model';

declare var bootstrap: any;

@Component({
  selector: 'app-player-layout',
  templateUrl: './player-layout.component.html',
  styleUrls: ['./player-layout.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PlayerLayoutComponent implements OnInit, OnDestroy {

  @ViewChild('videoPlayer') videoPlayerRef!: ElementRef<HTMLVideoElement>;

  courseId!: number;
  previewToken: string | null = null;
  isPreviewMode: boolean = false;

  isAdminMode: boolean = false;
  requestId: number | null = null;
  adminActionNote: string = '';
  isProcessingAdminAction: boolean = false;
  adminActionType: 'reject' | 'revision' | 'block_instructor' | null = null;

  qualityScoreData: TrainingQualityScoreDto | null = null;
  isLoadingScore: boolean = false;

  course: GetTraining | null = null;
  currentContent: any | null = null; 
  
  isLoading: boolean = true;        
  isContentLoading: boolean = false; 

  resumeContext: ActiveContentResumeDto | null = null;
  heartbeatSubscription: Subscription | null = null;
  lastLoggedSecond: number = 0;

  isSidebarOpen: boolean = true;
  openSections: { [key: number]: boolean } = {};
  activeTab: string = 'overview';
  viewType: 'video' | 'youtube' | 'image' | 'pdf' | 'exam' | 'unknown' = 'unknown';

  isExamRunnerVisible: boolean = false;
  activeExamId: number = 0;

  isPdfModalOpen: boolean = false;
  pdfSrc: any;
  currentPdfPage: number = 1;
  totalPdfPages: number = 0;
  
  timerInterval: any;
  timeRemaining: number = 0;
  elapsedTime: number = 0;
  totalPageTime: number = 0; 
  isTimerGreen: boolean = false;

  // 🔥 YOUTUBE API İÇİN DEĞİŞKENLER
  isYoutubeApiReady: boolean = false;
  ytPlayer: any = null;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private trainingApi: TrainingApiService,
    private logApi: LogApiService,
    private processService: TrainingProcessService,
    private instructorApi: InstructorApiService,
    private qualityScoreApi: TrainingQualityScoreApiService,
    private sanitizer: DomSanitizer,
    private toastr: ToastrService,
    private location: Location 
  ) {}

  ngOnInit(): void {
    this.initYoutubeAPI(); // 🔥 YOUTUBE SCRIPT'İNİ YÜKLE

    combineLatest([this.route.params, this.route.queryParams])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([params, queryParams]) => {
        const id = params['id'];
        this.previewToken = queryParams['previewToken'];

        if (queryParams['mode'] === 'admin') {
            this.isAdminMode = true;
            if(queryParams['requestId']) this.requestId = +queryParams['requestId'];
        }

        if (id) {
          this.courseId = +id;
          if (this.isAdminMode) this.loadQualityScore();
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
    if(this.ytPlayer) { this.ytPlayer.destroy(); }
  }

  @HostListener('window:beforeunload')
  onBeforeUnload() {
    this.sendBeaconLog();
  }

  goBack() {
      if (window.history.length > 1) {
          this.location.back();
      } else {
          this.router.navigate(['/courses']); 
      }
  }

  showPreviewNotification() {
    if (!sessionStorage.getItem('preview_toast_shown')) {
      setTimeout(() => {
        const msg = this.isAdminMode ? 'Yönetici İnceleme Modundasınız.' : 'Eğitmen Önizleme Modundasınız.';
        this.toastr.warning(msg, 'Bilgi', { timeOut: 3000 });
        sessionStorage.setItem('preview_toast_shown', 'true');
      }, 1000);
    }
  }

  loadQualityScore() {
      this.qualityScoreApi.getScore(this.courseId).subscribe({
          next: (res: any) => {
              if(res.header?.result) this.qualityScoreData = res.body; 
          },
          error: () => console.error("Skor çekilemedi")
      });
  }

  openQualityScoreModal() {
    const modalEl = document.getElementById('qualityScoreModal');
    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
    if(!this.qualityScoreData) this.loadQualityScore();
  }

  loadCourseData() {
    this.isLoading = true;
    this.trainingApi.getTrainingById(this.courseId, this.previewToken || undefined).subscribe({
      next: (res: any) => {
        if (res?.header && res.header.result === false) {
            this.isLoading = false;
            if (res.header.resCode === 403 || res.header.resCode === 401) {
                this.toastr.warning(res.header.msg || 'Bu eğitimi izleme yetkiniz yok.', 'Erişim Engellendi');
                this.router.navigate(['/course', this.courseId]); 
            } else {
                this.toastr.error(res.header.msg || 'Eğitim yüklenemedi.');
            }
            return;
        }

        this.course = res.body || res.data || res;
        this.resumeContext = this.course?.resumeContext || null;
        this.initPlayer();
        this.isLoading = false;
      },
      error: (err: any) => {
        this.isLoading = false;
        const isForbidden = err.status === 403 || err.status === 401 || err.error?.header?.resCode === 403;
        if (isForbidden) {
            this.toastr.warning(err.error?.header?.msg || err.error?.message || 'Bu eğitimi izleme yetkiniz yok.', 'Erişim Engellendi');
            this.router.navigate(['/course', this.courseId]); 
        } else {
            this.toastr.error('Eğitim yüklenemedi.');
        }
      }
    });
  }

  initPlayer() {
    if (!this.course?.trainingSections?.length) return;
    this.course.trainingSections.sort((a, b) => (a.trainingSectionRowNumber || 0) - (b.trainingSectionRowNumber || 0));
    this.course.trainingSections.forEach(section => {
        if(section.trainingContents) section.trainingContents.sort((a, b) => (a.orderId || 0) - (b.orderId || 0));
    });
    
    let targetId: number | undefined;
    if (this.resumeContext && this.resumeContext.contentId > 0) {
        targetId = this.resumeContext.contentId;
        if (this.resumeContext.sectionId) this.openSections[this.resumeContext.sectionId] = true;
    }
    else {
        const firstSection = this.course.trainingSections[0];
        if (firstSection.trainingSectionId) this.openSections[firstSection.trainingSectionId] = true;
        if (firstSection.trainingContents?.length) targetId = firstSection.trainingContents[0].id;
    }
    
    if (targetId) this.loadAndPlayContent(targetId, 'Resume');
  }

  onSidebarClick(content: TrainingContentDto) {
      if (content.isLocked && !this.isPreviewMode) {
          this.toastr.warning('Önceki dersleri tamamlamalısınız.', 'Kilitli İçerik');
          return;
      }
      if (this.currentContent?.id === content.id && this.viewType !== 'exam') return;
      this.loadAndPlayContent(content.id, 'Manual');
  }

  loadAndPlayContent(targetId?: number, triggerType: string = 'Manual') {
      if (this.currentContent) {
          this.sendBeaconLog();
          this.stopHeartbeat();
      }
      this.isContentLoading = true;
      this.pdfSrc = null; 
      this.isExamRunnerVisible = false;
      
      const payload: any = {
          trainingId: this.courseId,
          currentContentId: this.currentContent?.id,
          targetContentId: targetId,
          previewToken: this.previewToken 
      };
      if (triggerType === 'AutoNext' && !targetId) delete payload.targetContentId;
      
      this.trainingApi.getContent(payload).subscribe({
          next: (res: any) => {
              this.isContentLoading = false;
              if (res.data?.isTrainingFinished) {
                  this.toastr.success(res.data.message || 'Tebrikler! Eğitimi tamamladınız.');
                  return;
              }
              const playableContent = res.body?.content || res.data?.content || res.content || res;
              
              if (playableContent) {
                  // 🔥 GÜVENLİK SIZINTISI İÇİN İKİNCİ KONTROL (API'den gelse bile Frontend'den engelle)
                  if(playableContent.canView === false) {
                      this.toastr.warning(playableContent.blockMessage || 'Bu içeriği göremezsiniz.', 'Erişim Hatası');
                      return; 
                  }

                  this.currentContent = playableContent;
                  this.updateSidebarActiveState(playableContent.id);
                  this.detectViewType();
                  
                  if (this.viewType === 'exam') this.startExamSession(playableContent);
                  else this.setupPlayerAfterFetch();
              }
          },
          error: (err: any) => {
              this.isContentLoading = false;
              if (err.status === 403) this.toastr.warning(err.error?.message || 'Bu içeriğe erişim izniniz yok.', 'Erişim Engellendi');
              else this.toastr.error('İçerik yüklenemedi.');
          }
      });
  }

  updateSidebarActiveState(activeId: number) {
      // (İleride tıklanan dersi menüde otomatik scroll yaptırmak için kullanılacak)
  }
  setupPlayerAfterFetch() {
      if (this.viewType === 'pdf') {
          this.isPdfModalOpen = false;
          this.pdfSrc = this.getFileUrl();
          this.resetTimer();
          this.startHeartbeat();
      }
      else if (this.viewType === 'image') {
          // İmaj için sayaç beklemiyoruz, manuel butonla geçilecek. Sadece log başlatıyoruz.
          this.isTimerGreen = false; 
          this.startHeartbeat();
      }
      else if (this.viewType === 'youtube') {
          // HTML'in DOM'u render etmesi için küçük bir gecikme verip YT API'yi tetikliyoruz.
          setTimeout(() => { 
              this.loadYoutubeVideo(); 
              window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 100);
      }
      else if (this.viewType === 'video') {
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
      }
      else {
          this.startHeartbeat();
      }
  }

  // ==========================================
  // 🔥 YOUTUBE IFRAME API METOTLARI 
  // ==========================================
  initYoutubeAPI() {
      if (!(window as any).YT) {
          const tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          document.body.appendChild(tag);
          (window as any).onYouTubeIframeAPIReady = () => {
              this.isYoutubeApiReady = true;
          };
      } else {
          this.isYoutubeApiReady = true;
      }
  }

loadYoutubeVideo() {
      if (!this.isYoutubeApiReady) {
          setTimeout(() => this.loadYoutubeVideo(), 500); // API yüklenmediyse bekle
          return;
      }

      const videoId = this.extractYoutubeId(this.getFileUrl());
      if (!videoId) return;

      // 🔥 1. ADIM: Kaldığımız saniyeyi bul (ResumeContext veya LastWatchedPart)
      let seekTime = 0;
      if (this.resumeContext && this.currentContent?.id === this.resumeContext.contentId) {
          seekTime = this.resumeContext.lastWatchedSecond;
          this.resumeContext = null; // Bir kere kullanıldı, temizle
      } 
      else if (this.currentContent?.lastWatchedPart > 0 && !this.currentContent?.isCompleted) {
          seekTime = this.currentContent.lastWatchedPart;
      }

      // 🔥 2. ADIM: YouTube Player'ı Başlat veya Güncelle (Kaldığı Saniye İle)
      if (this.ytPlayer && typeof this.ytPlayer.loadVideoById === 'function') {
          // Player zaten varsa ve ders değiştiyse yeni videoyu saniyesinden yükle
          if (seekTime > 0) {
              this.ytPlayer.loadVideoById({ videoId: videoId, startSeconds: seekTime });
          } else {
              this.ytPlayer.loadVideoById(videoId);
          }
      } else {
          // Player ilk defa oluşturuluyorsa
          this.ytPlayer = new (window as any).YT.Player('youtube-player-container', {
              videoId: videoId,
              playerVars: { 
                  autoplay: 1, 
                  modestbranding: 1, 
                  rel: 0,
                  start: seekTime > 0 ? seekTime : 0 // Direkt kaldığı saniyeden başlatır
              },
              events: {
                  'onReady': (event: any) => {
                      // Bazen playerVars start parametresini ezebilir, garanti olsun diye Ready olunca da o saniyeye sar
                      if (seekTime > 0) {
                          event.target.seekTo(seekTime, true);
                      }
                  },
                  'onStateChange': this.onYoutubeStateChange.bind(this)
              }
          });
      }
  }

  onYoutubeStateChange(event: any) {
      const state = event.data;
      if (state === 1) { // PLAYING
          this.startHeartbeat();
          this.logProgress('Play');
      } 
      else if (state === 2) { // PAUSED
          this.stopHeartbeat();
          this.logProgress('Pause');
      } 
      else if (state === 0) { // ENDED
          this.stopHeartbeat();
          this.logProgress('Complete');
          this.toastr.success('Ders tamamlandı. Sonrakine geçiliyor...');
          setTimeout(() => this.loadAndPlayContent(undefined, 'AutoNext'), 2000);
      }
  }

  extractYoutubeId(url: string): string {
      const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      return (match && match[1]) ? match[1] : '';
  }
  // ==========================================


  startExamSession(content: any) {
      if (content.examId) {
          this.activeExamId = content.examId;
          this.isExamRunnerVisible = true;
          this.logProgress('StartExam'); 
      } else {
          this.toastr.error("Sınav verisi eksik.");
      }
  }

  onExamClosed(event: any) {
      const isFinished = event as boolean;
      this.isExamRunnerVisible = false;
      this.activeExamId = 0;
      if (isFinished) {
          this.logProgress('Complete');
          if (this.currentContent) this.updateSidebarStatus(this.currentContent.id, true);
          this.toastr.success('Sınav tamamlandı. Sonraki derse geçiliyor...');
          setTimeout(() => this.loadAndPlayContent(undefined, 'AutoNext'), 1500);
      } else {
          this.toastr.info("Sınavdan çıkıldı.");
      }
  }

  startHeartbeat() {
    this.stopHeartbeat();
    if (this.isPreviewMode) return; 
    this.heartbeatSubscription = interval(10000).subscribe(() => { this.logProgress('Heartbeat'); });
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
    else if (this.viewType === 'youtube' && this.ytPlayer) {
        try {
            currentSecond = Math.floor(this.ytPlayer.getCurrentTime() || 0);
            totalDuration = Math.floor(this.ytPlayer.getDuration() || 0);
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
    } else if (this.viewType === 'youtube' && this.ytPlayer) {
        try { currentSecond = Math.floor(this.ytPlayer.getCurrentTime()); } catch(e) {}
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

  onVideoLoadedMetadata() {
    let seekTime = 0;
    if (this.resumeContext && this.currentContent?.id === this.resumeContext.contentId) {
        seekTime = this.resumeContext.lastWatchedSecond;
        this.resumeContext = null; 
    } 
    else if (this.currentContent?.lastWatchedPart > 0 && !this.currentContent?.isCompleted) {
        seekTime = this.currentContent.lastWatchedPart;
    }
    if (seekTime > 0 && this.videoPlayerRef?.nativeElement) {
        this.videoPlayerRef.nativeElement.currentTime = seekTime;
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

  // 🔥 GÖRSEL İÇİN MANUEL TAMAMLAMA BUTONU FONKSİYONU
  markImageAsCompleted() {
      this.isTimerGreen = true;
      this.logProgress('Complete');
      this.toastr.success('Görsel incelendi. Sonraki derse geçebilirsiniz.');
  }

  getFileUrl(): string {
    return this.currentContent?.filePath || 
           this.currentContent?.trainingContentLibraryDto?.trainingContentLibraryFilePath || 
           '';
  }

  detectViewType() {
    if (!this.currentContent) { this.viewType = 'unknown'; return; }
    const typeCode = this.currentContent.contentType?.code?.toLowerCase() || '';
    const typeTitle = this.currentContent.contentType?.title?.toLowerCase() || '';
    
    if (typeCode === 'exm' || typeTitle === 'exam' || this.currentContent.examId) {
        this.viewType = 'exam';
        return;
    }
    const url = this.getFileUrl().toLowerCase();
    if (typeTitle === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
        this.viewType = 'youtube';
    }
    else if (url.endsWith('.pdf') || typeTitle === 'document') {
        this.viewType = 'pdf';
    }
    else if (typeTitle === 'lecture' || typeTitle === 'video' || url.match(/\.(mp4|webm|ogg|mov)$/)) {
        this.viewType = 'video';
    }
    else if (url.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        this.viewType = 'image';
    }
    else {
        if (url.includes('.mp4')) this.viewType = 'video';
        else this.viewType = 'unknown';
    }
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

  getDuration(content: any): string { return content.time || ''; }
  getIconClass(content: any): string {
      let type = content.contentType?.title?.toLowerCase() || '';
      if (type === 'exam' || content.contentType?.code === 'exm') return 'bx-task text-warning'; 
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
            if (foundCurrent) return content.title;
            if (content.id === this.currentContent.id) foundCurrent = true;
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

  openPdfModal() { this.isPdfModalOpen = true; 
      // 🔥 PDF SÜRESİ İÇİN FALLBACK (YEDEK) EKLENDİ
      const t = this.currentContent?.minReadTimeThreshold || 15; 
      this.setupTimer(t); 
      this.startTimer(); 
  }
  closePdfModal() { this.isPdfModalOpen = false; this.stopTimer(); }
  onPdfLoaded(event: any) { this.totalPdfPages = event.pagesCount; this.currentPdfPage = 1; }
  nextPdfPage() { if (this.currentPdfPage < this.totalPdfPages) this.currentPdfPage++; }
  prevPdfPage() { if (this.currentPdfPage > 1) this.currentPdfPage--; }
  
  setupTimer(s: number) { 
      this.totalPageTime = s; 
      this.timeRemaining = s; 
      this.elapsedTime = 0; 
      this.isTimerGreen = false; 
      if(this.isPreviewMode) this.isTimerGreen = true; 
  }
  
  stopTimer() { 
      if (this.timerInterval) { 
          clearInterval(this.timerInterval); 
          this.timerInterval = null; 
      } 
  }
  
  resetTimer() { 
      this.stopTimer(); 
      this.elapsedTime = 0; 
      this.timeRemaining = 0; 
      this.isTimerGreen = false; 
  }
  
  startTimer() {
      this.stopTimer(); 
      if (this.isPreviewMode) return;
      this.timerInterval = setInterval(() => {
          if (this.timeRemaining > 0) { 
              this.timeRemaining--; 
              this.elapsedTime++; 
          }
          else { 
              this.isTimerGreen = true; 
              this.stopTimer(); 
              this.toastr.success('İçerik okuma süresi tamamlandı.'); 
              this.logProgress('Complete'); 
          }
      }, 1000);
  }

  // ... (Admin Actions kodları aynı) ...
  approveTraining() {
    if(!this.requestId) return;
    if(!confirm("Bu eğitimi yayınlamak istediğinize emin misiniz?")) return;
    this.isProcessingAdminAction = true;
    const dto = { requestId: this.requestId, decision: 1, adminNote: "Player üzerinden onaylandı." }; 
    this.processService.respondToRequest(dto).subscribe({
        next: (res) => {
            this.isProcessingAdminAction = false;
            if(res.header.result) {
                this.toastr.success("Eğitim başarıyla yayına alındı.");
                setTimeout(() => window.close(), 1500);
            } else this.toastr.warning(res.header.message);
        },
        error: () => { this.isProcessingAdminAction = false; this.toastr.error("İşlem hatası."); }
    });
  }

  openAdminModal(type: 'reject' | 'revision' | 'block_instructor') {
    this.adminActionType = type;
    this.adminActionNote = '';
    const modalEl = document.getElementById('adminActionModal');
    if (modalEl) new bootstrap.Modal(modalEl).show();
  }

  closeAdminModal() {
    const modalEl = document.getElementById('adminActionModal');
    if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    }
  }

  submitAdminAction() {
    if (!this.adminActionNote.trim()) { this.toastr.warning("Lütfen bir açıklama/sebep giriniz."); return; }
    this.isProcessingAdminAction = true;

    if (this.adminActionType === 'block_instructor') {
        if (!this.course?.instructorId) { this.toastr.error("Eğitmen bilgisi bulunamadı."); this.isProcessingAdminAction = false; return; }
        this.instructorApi.changeInstructorStatus(this.course.instructorId, false, this.adminActionNote).subscribe({
            next: (res) => {
                this.isProcessingAdminAction = false;
                if(res.header.result) { this.toastr.success("Eğitmen başarıyla kilitlendi."); this.closeAdminModal(); }
                else this.toastr.warning(res.header.message);
            },
            error: () => { this.isProcessingAdminAction = false; this.toastr.error("Banlama hatası."); }
        });
    }
    else {
        if(!this.requestId) { this.toastr.error("Request ID eksik."); this.isProcessingAdminAction = false; return; }
        const decisionId = this.adminActionType === 'reject' ? 2 : 3; 
        const dto = { requestId: this.requestId, decision: decisionId, adminNote: this.adminActionNote };
        this.processService.respondToRequest(dto).subscribe({
            next: (res) => {
                this.isProcessingAdminAction = false;
                if(res.header.result) {
                    this.toastr.success(res.body.message || "İşlem tamamlandı.");
                    this.closeAdminModal();
                    setTimeout(() => window.close(), 1500);
                } else this.toastr.warning(res.header.message);
            },
            error: () => { this.isProcessingAdminAction = false; this.toastr.error("İşlem hatası."); }
        });
    }
  }
}