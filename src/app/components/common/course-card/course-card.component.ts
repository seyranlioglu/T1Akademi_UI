import { Component, Input, OnInit } from '@angular/core';
import { TrainingCard } from 'src/app/shared/models/training-card.model';

@Component({
  selector: 'app-course-card',
  templateUrl: './course-card.component.html',
  styleUrls: ['./course-card.component.scss']
})
export class CourseCardComponent implements OnInit {
  // Input olarak gelen veride categoryId veya parentCategoryId olduğunu varsayıyoruz.
  // Model dosyasında bu alanlar yoksa any olarak işaretleyebilirsin: @Input() training!: any;
  @Input() training!: any; 

  constructor() { }

  ngOnInit(): void {
  }

  // --- RESİM HATA YÖNETİMİ ---
  // Resim yüklenemezse (404) devreye girer
  handleMissingImage(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    const fallback = this.getFallbackImage();

    // Sonsuz döngü koruması: Zaten fallback resmini deniyorsa dur.
    if (imgElement.src.includes(fallback)) {
        return;
    }

    imgElement.src = fallback;
  }

  // --- KATEGORİ BAZLI YEDEK RESİM ---
  getFallbackImage(): string {
    // Verideki kategori ID'sine bak
    const id = this.training.categoryId || this.training.parentCategoryId;
    
    // ID varsa kategori png'sini döndür, yoksa genel default
    if (id) {
        return `assets/images/defaults/category${id}.png`;
    }
    
    return  `assets/images/defaults/category${id}.png`; // Hiçbiri yoksa son çare
  }
}