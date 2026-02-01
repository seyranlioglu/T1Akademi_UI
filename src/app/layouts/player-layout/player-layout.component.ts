import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { loadCourse } from 'src/app/shared/store/course.actions';
import { selectSelectedCourse } from 'src/app/shared/store/course.reducer';

@Component({
  selector: 'app-player-layout',
  templateUrl: './player-layout.component.html',
  styleUrls: ['./player-layout.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PlayerLayoutComponent implements OnInit, OnDestroy {
  
  // --- TEMEL DEĞİŞKENLER ---
  courseId: number | null = null;
  previewToken: string | null = null;
  isPreviewMode: boolean = false;
  
  course: any = null;
  currentContent: any = null;
  
  // 🔥 YENİ: Aktif Sekme (Varsayılan: 'overview')
  activeTab: string = 'overview';

  isSidebarOpen: boolean = true;
  openSections: { [key: number]: boolean } = {};
  
  viewType: 'video' | 'image' | 'pdf' | 'exam' | 'unknown' = 'unknown';
  
  pdfSrc: string | any = ''; 

  // --- TIMER & MODAL ---
  isPdfModalOpen: boolean = false;
  
  totalPageTime: number = 0;
  timeRemaining: number = 0;
  elapsedTime: number = 0;
  
  timeSpentOnPage: number = 0;
  requiredTimePerPage: number = 0;
  
  completionThreshold: number = 0.9;
  isTimerGreen: boolean = false;
  
  canPassPage: boolean = false;
  canProceed: boolean = false;
  
  timerInterval: any;
  currentPdfPage: number = 1;
  totalPdfPages: number = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<any>,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    combineLatest([this.route.paramMap, this.route.queryParams])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([params, queryParams]) => {
        const id = params.get('id');
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

    this.store.select(selectSelectedCourse)
      .pipe(takeUntil(this.destroy$))
      .subscribe(course => {
        if (course) {
          this.course = course;
          this.initPlayer();
        }
      });

    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopTimer();
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }

  loadCourseData() {
    if (this.courseId) {
      this.store.dispatch(loadCourse({ 
        courseId: this.courseId, 
        previewToken: this.previewToken || undefined 
      }));
    }
  }

  handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && this.isPreviewMode) {
      console.log('🔄 Eğitim Önizleme: Senkronizasyon...');
      this.loadCourseData();
      this.toastr.info('İçerik güncellendi.', 'Senkronizasyon', { timeOut: 1500 });
    }
  }

  showPreviewNotification() {
    if(!sessionStorage.getItem('preview_toast_shown')){
        setTimeout(() => {
            this.toastr.warning('Eğitmen Önizleme Modundasınız.', 'Bilgi', { timeOut: 3000 });
            sessionStorage.setItem('preview_toast_shown', 'true');
        }, 1000);
    }
  }

  initPlayer() {
    if (this.course?.trainingSections?.length > 0) {
      const firstSection = this.course.trainingSections[0];
      if (Object.keys(this.openSections).length === 0) {
          const sectionId = firstSection.trainingSectionId || firstSection.id;
          this.openSections[sectionId] = true;
      }

      if (!this.currentContent && firstSection.trainingContents?.length > 0) {
        this.selectContent(firstSection.trainingContents[0]);
      }
    }
  }

  selectContent(content: any) {
    if(this.currentContent?.id === content.id) return;

    this.currentContent = content;
    this.isPdfModalOpen = false;
    this.detectViewType();
    this.pdfSrc = this.getCurrentFilePath();
    this.resetTimer();
    
    if (this.viewType === 'image') {
        this.setupTimer(10); 
        this.startTimer();
    }
  }

  // 🔥 YENİ: Sekme Değiştirme
  setActiveTab(tabName: string) {
      this.activeTab = tabName;
  }

  detectViewType() {
    if (!this.currentContent) {
        this.viewType = 'unknown';
        return;
    }

    if (this.currentContent.contentType?.code === 'exm') {
        this.viewType = 'exam';
        return;
    }

    const lib = this.currentContent.contentLibrary || this.currentContent.trainingContentLibraryDto || {};
    const fileName = (lib.fileName || lib.FileName || lib.trainingContentLibraryFileName || this.currentContent.title || '').toLowerCase();
    const filePath = (lib.filePath || lib.FilePath || lib.trainingContentLibraryFilePath);

    if (fileName.endsWith('.pdf')) {
        this.viewType = 'pdf';
    } else if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        this.viewType = 'image';
    } else if (fileName.match(/\.(mp4|webm|ogg|mov)$/)) {
        this.viewType = 'video';
    } else {
        this.viewType = filePath ? 'video' : 'unknown';
    }
  }

  getVideoUrl(): string {
      const url = this.getCurrentFilePath();
      if (!url) return '';

      const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = url.match(youtubeRegex);

      if (match && match[1]) {
          return `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0&modestbranding=1`;
      }

      const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
      const vimeoMatch = url.match(vimeoRegex);
      
      if (vimeoMatch && vimeoMatch[1]) {
          return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
      }

      return url;
  }

  // --- TIMER ---

  setupTimer(durationInSeconds: number) {
      this.totalPageTime = durationInSeconds;
      this.requiredTimePerPage = durationInSeconds;
      this.timeRemaining = durationInSeconds;
      this.elapsedTime = 0;
      this.timeSpentOnPage = 0;
      this.isTimerGreen = false;
      this.canPassPage = false; 
      this.canProceed = false;

      if (this.isPreviewMode) {
          this.isTimerGreen = true;
          this.canPassPage = true;
          this.canProceed = true;
          this.timeRemaining = 0;
      }
  }

  startTimer() {
    this.stopTimer();
    if (this.isPreviewMode) return;

    this.timerInterval = setInterval(() => {
        if (this.timeRemaining > 0) {
            this.timeRemaining--;
            this.elapsedTime++;
            this.timeSpentOnPage = this.elapsedTime;

            const progress = this.elapsedTime / this.totalPageTime;
            if (progress >= this.completionThreshold) {
                if (!this.isTimerGreen) {
                    this.isTimerGreen = true;
                    this.canPassPage = true;
                    this.canProceed = true;
                    this.toastr.success('Süre tamamlandı.', '', { timeOut: 2000 });
                }
            }
        } else {
            this.stopTimer();
        }
    }, 1000);
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
    this.timeSpentOnPage = 0;
    this.timeRemaining = 0;
    this.isTimerGreen = false;
    this.canPassPage = false;
    this.canProceed = false;
  }

  // --- PDF MODAL ---

  openPdfModal() {
      this.isPdfModalOpen = true;
      const minMinutes = this.currentContent.minReadTimeThreshold || 2; 
      const totalSeconds = minMinutes * 60; 
      this.setupTimer(totalSeconds); 
      this.startTimer();
  }

  closePdfModal() {
      this.isPdfModalOpen = false;
      this.stopTimer(); 
  }

  onPdfLoaded(event: any) {
      this.totalPdfPages = event.pagesCount;
      this.currentPdfPage = 1;
  }

  nextPdfPage() {
      if (this.currentPdfPage < this.totalPdfPages) {
          this.currentPdfPage++;
      }
  }

  prevPdfPage() {
      if (this.currentPdfPage > 1) {
          this.currentPdfPage--;
      }
  }

  onPdfPageChange(pageNumber: number) {
      this.currentPdfPage = pageNumber;
  }

  // --- UI HELPERS ---

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleSection(sectionId: number) {
    this.openSections[sectionId] = !this.openSections[sectionId];
  }

  getIconClass(content: any): string {
    if (content.contentType?.code === 'exm') return 'bx-task text-warning';
    const lib = content.contentLibrary || content.trainingContentLibraryDto || {};
    const fileName = (lib.fileName || lib.trainingContentLibraryFileName || content.title || '').toLowerCase();
    if (fileName.endsWith('.pdf')) return 'bxs-file-pdf text-danger';
    if (fileName.match(/\.(jpg|jpeg|png)$/)) return 'bxs-image text-success';
    return 'bx-play-circle'; 
  }

  getCurrentFilePath(): string {
      const lib = this.currentContent?.contentLibrary || this.currentContent?.trainingContentLibraryDto;
      return lib?.filePath || lib?.trainingContentLibraryFilePath || '';
  }

  getCurrentThumbnail(): string {
      const lib = this.currentContent?.contentLibrary || this.currentContent?.trainingContentLibraryDto;
      return lib?.thumbnail || lib?.trainingContentLibraryThumbnail || '';
  }
}