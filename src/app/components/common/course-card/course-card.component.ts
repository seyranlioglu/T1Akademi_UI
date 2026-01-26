import { Component, Input, OnInit } from '@angular/core';
import { TrainingCard } from 'src/app/shared/models/dashboard.model'; 

@Component({
  selector: 'app-course-card',
  templateUrl: './course-card.component.html',
  styleUrls: ['./course-card.component.scss']
})
export class CourseCardComponent implements OnInit {
  
  @Input() training!: TrainingCard | any; 

  constructor() { }

  ngOnInit(): void {
  }

  // --- RESİM MANTIĞI (GÜNCELLENMİŞ HALİ) ---
  getCardImage(): string {
      // 1. Backend'den gelen resim kontrolü
      // "none" değilse ve boş değilse kullan
      if (this.training.headerImage && 
          this.training.headerImage.toLowerCase() !== 'none' && 
          this.training.headerImage.trim() !== '' &&
          !this.training.headerImage.includes('default.jpg')) {
          return this.training.headerImage;
      }

      // imageUrl varsa ve "none" değilse kullan (Yedek alan)
      if (this.training.imageUrl && 
          this.training.imageUrl.toLowerCase() !== 'none' && 
          this.training.imageUrl.trim() !== '' &&
          !this.training.imageUrl.includes('default.jpg')) {
          return this.training.imageUrl;
      }

      // 2. Kategori Resmi Mantığı (Parent Öncelikli)
      const id = (this.training.parentCategoryId && this.training.parentCategoryId > 0)
                 ? this.training.parentCategoryId
                 : this.training.categoryId;

      // ID varsa category{id}.png döndür
      if (id && id > 0) {
          return `assets/images/defaults/category${id}.png`;
      }

      // 3. Hiçbiri yoksa Default
      return 'assets/images/defaults/default.jpg';
  }

  handleMissingImage(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    
    // Sonsuz döngü koruması
    if (imgElement.src.includes('default.jpg')) return;
    
    // Kategori resmi de yoksa default.jpg
    imgElement.src = 'assets/images/defaults/default.jpg';
  }
}