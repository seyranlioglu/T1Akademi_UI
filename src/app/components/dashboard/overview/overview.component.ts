import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router'; // Router eklendi
import { OwlOptions } from 'ngx-owl-carousel-o'; 
import { Subscription } from 'rxjs';
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { CertificateApiService } from 'src/app/shared/api/certificate-api.service'; // Sertifika servisi eklendi
import { ContinueTraining, DashboardStats, TrainingCard } from 'src/app/shared/models/dashboard.model';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit, OnDestroy {
  
  viewMode: 'list' | 'calendar' = 'list';
  
  assignedTrainings: any[] = []; 
  recommendedTrainings: any[] = []; 
  myCertificates: any[] = []; 
  
  stats: DashboardStats | null = null;
  continueData: ContinueTraining | null = null;
  
  todayString: string = '';
  dayString: string = '';
  loading = true;

  private subs = new Subscription();

  customOptions: OwlOptions = {
    loop: false, 
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    navText: ['<i class="bx bx-chevron-left"></i>', '<i class="bx bx-chevron-right"></i>'],
    nav: true,
    margin: 20, 
    responsive: {
      0: { items: 1 },
      480: { items: 2 },
      768: { items: 3 },
      992: { items: 4 },
      1200: { items: 5 },
      1400: { items: 6 }
    }
  };

  constructor(
    private trainingService: TrainingApiService,
    private certApi: CertificateApiService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.setTurkishDate();
    this.loadDashboardData();
  }

  // 1. SORUNUN ÇÖZÜMÜ: TÜRKÇE TARİH
  setTurkishDate() {
      const date = new Date();
      this.todayString = new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
      this.dayString = new Intl.DateTimeFormat('tr-TR', { weekday: 'long' }).format(date);
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // İstatistikler
    this.subs.add(this.trainingService.getUserStats().subscribe(res => this.stats = res));
    
    // Son İzlenen Eğitim
    this.subs.add(this.trainingService.getLastActiveTraining().subscribe(res => this.continueData = res));
    
    // Bana Atanan (Zorunlu) Eğitimler - MyTrainings endpoint'i daha dolu veri döner
    this.subs.add(this.trainingService.getMyTrainings().subscribe((res: any) => {
        // Genelde atanan eğitimleri "NotStarted" veya "Active" olanlar olarak filtreleyebilirsin.
        // Biz burada henüz bitmemiş olan aktif eğitimleri gösterelim
        const all = res.body || res.data || res || [];
        this.assignedTrainings = all.filter((t: any) => !t.isCompleted).slice(0, 5); // İlk 5'ini göster
    }));

    // 2. SORUNUN ÇÖZÜMÜ: SERTİFİKALARI GETİR
    this.subs.add(this.certApi.getMyCertificates().subscribe({
        next: (res: any) => {
            this.myCertificates = res.body || res.data || res || [];
        }
    }));
    
    // Önerilenler
    this.subs.add(this.trainingService.getRecommendedTrainings().subscribe(res => {
        this.recommendedTrainings = res || [];
        this.loading = false; // Son işlem bitince loading kalksın
    }));
  }

  // --- İŞLEVSEL BUTON AKSİYONLARI ---

  goToPlayer(trainingId: number) {
      this.router.navigate(['/course-player', trainingId]);
  }

  openCertificate(url: string | null) {
      if (url) window.open(url, '_blank');
  }

  handleMissingImage(event: Event, item?: any) {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement.src.includes('default.jpg')) return;
    imgElement.src = 'assets/images/defaults/default.jpg';
  }

  ngOnDestroy(): void {
      this.subs.unsubscribe();
  }
}