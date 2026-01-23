import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o'; 
import { DashboardApiService } from 'src/app/shared/api/dashboard-api.service';
import { ContinueTrainingDto, DashboardStatsDto, UserCertificateDto } from 'src/app/shared/models/dashboard.model';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  
  viewMode: 'list' | 'calendar' = 'list';
  
  // Resim mantığı için tipleri 'any' olarak kullanıyoruz
  assignedTrainings: any[] = []; 
  recommendedTrainings: any[] = []; 
  myCertificates: UserCertificateDto[] = []; 
  
  stats: DashboardStatsDto | null = null;
  continueData: ContinueTrainingDto | null = null;
  
  today = new Date();
  loading = true;

  // Owl Carousel (Slider) Ayarları
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
    
    // 1. İstatistikler
    this.dashboardService.getStats().subscribe(res => this.stats = res);
    
    // 2. Devam Eden Eğitim
    this.dashboardService.getContinueLearning().subscribe(res => {
        if (res) {
            this.continueData = this.processSingleImage(res);
        }
    });
    
    // 3. Atanan Eğitimler (Tablo)
    this.dashboardService.getAssignedTrainings().subscribe(res => {
        this.assignedTrainings = this.processImages(res || []);
    });
    
    // 4. Önerilen Eğitimler (Slider)
    this.dashboardService.getRecommendedTrainings().subscribe(res => {
        this.recommendedTrainings = this.processImages(res || []);
    });
    
    // 5. Sertifikalar
    this.dashboardService.getMyCertificates().subscribe(res => {
        this.myCertificates = res || [];
        this.loading = false;
    });
  }

  // --- RESİM İŞLEME MANTIĞI (LİSTE) ---
  processImages(list: any[]): any[] {
    return list.map(item => {
        const imageId = item.categoryId || item.parentCategoryId;
        const fallbackPng = `assets/images/defaults/category${imageId}.png`;

        // Eğer veride resim yoksa, direkt kategori PNG'sini ata
        if (!item.headerImage && !item.imageUrl) {
            item.headerImage = fallbackPng;
            item.imageUrl = fallbackPng;
        } else {
             // headerImage var ama imageUrl yoksa eşitle
             if(!item.imageUrl) item.imageUrl = item.headerImage;
             if(!item.headerImage) item.headerImage = item.imageUrl;
        }
        return item;
    });
  }

  // --- RESİM İŞLEME MANTIĞI (TEKİL) ---
  processSingleImage(item: any): any {
      if (!item) return null;
      
      const imageId = item.categoryId || item.parentCategoryId;
      const fallbackPng = `assets/images/defaults/category${imageId}.png`;

      if (!item.headerImage && !item.imageUrl) {
          item.headerImage = fallbackPng;
          item.imageUrl = fallbackPng;
      }
      return item;
  }

  // --- RESİM HATA YÖNETİMİ (KESİN KURAL) ---
  // Hata durumunda SADECE category{id}.png yoluna git.
  handleMissingImage(event: Event, item: any) {
      const target = event.target as HTMLImageElement;
      const imageId = item.categoryId || item.parentCategoryId;
      
      // Hedef yol:
      const categoryPng = `assets/images/defaults/category${imageId}.png`;

      // Eğer mevcut kaynak zaten bu PNG ise ve yine hata verdiyse DUR (Sonsuz döngü engelleme)
      if (target.src.includes(`category${imageId}.png`)) {
          return;
      }

      // Kırık linki kategori PNG'si ile değiştir
      target.src = categoryPng;
  }
}