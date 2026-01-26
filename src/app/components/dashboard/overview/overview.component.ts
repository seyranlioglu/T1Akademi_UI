import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o'; 
import { TrainingApiService } from 'src/app/shared/api/training-api.service';
import { ContinueTraining, DashboardStats, TrainingCard, UserCertificateDto } from 'src/app/shared/models/dashboard.model';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  
  viewMode: 'list' | 'calendar' = 'list';
  
  assignedTrainings: TrainingCard[] = []; 
  recommendedTrainings: TrainingCard[] = []; 
  myCertificates: UserCertificateDto[] = []; 
  
  stats: DashboardStats | null = null;
  continueData: ContinueTraining | null = null;
  
  today = new Date();
  loading = true;

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

  constructor(private trainingService: TrainingApiService) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    this.trainingService.getUserStats().subscribe(res => this.stats = res);
    
    this.trainingService.getLastActiveTraining().subscribe(res => {
         this.continueData = res;
    });
    
    this.trainingService.getAssignedTrainings().subscribe(res => {
        this.assignedTrainings = res || [];
    });
    
    this.trainingService.getRecommendedTrainings().subscribe(res => {
        this.recommendedTrainings = res || [];
        this.loading = false; // Yükleme bitti
    });
  }

  // --- EKSİK OLAN METOT BURAYA EKLENDİ ---
  handleMissingImage(event: Event, item?: any) {
    const imgElement = event.target as HTMLImageElement;
    
    // Sonsuz döngü koruması
    if (imgElement.src.includes('default.jpg')) return;

    // Eğer item geldiyse ve kategori ID'si varsa kategori resmini dene
    if (item && (item.categoryId || item.parentCategoryId)) {
        const id = item.categoryId || item.parentCategoryId;
        const categoryImg = `assets/images/defaults/category${id}.png`;
        
        // Eğer zaten kategori resmini deniyorsa ve o da yoksa default'a dön
        if (imgElement.src.includes(`category${id}.png`)) {
            imgElement.src = 'assets/images/defaults/default.jpg';
        } else {
            imgElement.src = categoryImg;
        }
    } else {
        // Hiçbir bilgi yoksa direkt default
        imgElement.src = 'assets/images/defaults/default.jpg';
    }
  }
}