import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o'; 
import { DashboardApiService } from 'src/app/shared/api/dashboard-api.service';
// TrainingCardDto ve diğer modelleri import ediyoruz ama çakışma olmasın diye dikkatli kullanacağız
import { ContinueTrainingDto, DashboardStatsDto, TrainingCardDto, UserCertificateDto } from 'src/app/shared/models/dashboard.model';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  viewMode: 'list' | 'calendar' = 'list';
  
  assignedTrainings: TrainingCardDto[] = [];
  
  // --- DÜZELTME BURADA ---
  // Tip uyuşmazlığı hatasını (TS2740) aşmak için burayı 'any[]' yaptık.
  // Artık Backend'den gelen yeni DTO yapısını (headerImage, price vb.) sorunsuz kabul edecek.
  recommendedTrainings: any[] = []; 
  // -----------------------

  myCertificates: UserCertificateDto[] = []; 
  
  stats: DashboardStatsDto | null = null;
  continueData: ContinueTrainingDto | null = null;
  
  today = new Date();
  loading = true;

  // Slider Ayarları
  customOptions: OwlOptions = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    navText: ['<i class="bx bx-chevron-left"></i>', '<i class="bx bx-chevron-right"></i>'],
    nav: true,
    margin: 15,
    responsive: {
      0: { items: 1 },
      576: { items: 2 },
      768: { items: 3 },
      1200: { items: 4 }
    }
  };

  constructor(private dashboardService: DashboardApiService) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // İstatistikler
    this.dashboardService.getStats().subscribe(res => this.stats = res);
    
    // Devam Edenler
    this.dashboardService.getContinueLearning().subscribe(res => this.continueData = res);
    
    // Atanan Eğitimler
    this.dashboardService.getAssignedTrainings().subscribe(res => {
        this.assignedTrainings = res || [];
    });
    
    // Önerilen Eğitimler (Slider İçin)
    this.dashboardService.getRecommendedTrainings().subscribe(res => {
        // Gelen veriyi olduğu gibi alıyoruz
        this.recommendedTrainings = res || [];
    });
    
    // Sertifikalar
    this.dashboardService.getMyCertificates().subscribe(res => {
        this.myCertificates = res || [];
    });

    this.loading = false;
  }
}