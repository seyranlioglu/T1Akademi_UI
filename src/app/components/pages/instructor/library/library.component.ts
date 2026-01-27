import { Component, OnInit, HostListener } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { environment } from 'src/environments/environment';

// Import yolları
import { ContentLibraryApiService } from 'src/app/shared/api/content-library-api.service';
import { UploadModalComponent } from 'src/app/components/common/modals/upload-modal/upload-modal.component';
import { ContentPreviewModalComponent } from 'src/app/components/common/modals/content-preview-modal/content-preview-modal.component';

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss'],
  providers: [DialogService]
})
export class LibraryComponent implements OnInit {
  
  files: any[] = [];
  imageBaseUrl = environment.apiUrl.replace('/api', ''); 
  
  activeMenuId: number | null = null; // Dropdown kontrolü için

  // --- YENİ EKLENEN: Kullanım Detayı Dialog Değişkenleri ---
  displayUsageDialog: boolean = false;
  selectedUsageItem: any = null;
  // --------------------------------------------------------

  constructor(
    private dialogService: DialogService,
    private contentService: ContentLibraryApiService
  ) {}

  ngOnInit(): void {
    this.getFiles();
  }

  // Menü Aç/Kapa
  toggleMenu(event: Event, id: number) {
    event.stopPropagation(); 
    if (this.activeMenuId === id) {
      this.activeMenuId = null; 
    } else {
      this.activeMenuId = id; 
    }
  }

  // Dışarı Tıklayınca Menüyü Kapat
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    this.activeMenuId = null;
  }

  getFiles() {
    this.contentService.getLibrary().subscribe({
      next: (res: any) => {
        if (res.header && res.header.result) {
          this.files = res.body || [];
        }
      },
      error: (err) => {
        console.error('Liste çekilemedi', err);
      }
    });
  }

  getThumbnailUrl(path: string): string {
    if (!path) return 'assets/images/placeholder.jpg';
    const cleanPath = path.replace(/\\/g, '/');
    return `${this.imageBaseUrl}/${cleanPath}`; 
  }

  openUploadModal() {
    const ref = this.dialogService.open(UploadModalComponent, {
      header: 'Yeni İçerik Yükle', width: '500px', contentStyle: { overflow: 'visible' },
      appendTo: 'body', baseZIndex: 10000, modal: true, dismissableMask: false
    });
    ref.onClose.subscribe((success: boolean) => { if (success) this.getFiles(); });
  }

  openPreview(item: any) {
    const ref = this.dialogService.open(ContentPreviewModalComponent, {
      header: item.fileName, width: '80%', height: 'auto', baseZIndex: 10000,
      modal: true, dismissableMask: true, data: item 
    });
    ref.onClose.subscribe((updated: boolean) => { if (updated) this.getFiles(); });
  }

  // --- GÜNCELLENEN METOD: Alert yerine Dialog açıyor ---
showUsage(item: any) {
    // Menüyü her türlü kapat (tıklama sonrası açık kalmasın)
    this.activeMenuId = null;

    // Eğer eğitimlerde kullanılıyorsa Dialog'u aç
    if (item.trainingUsed && item.trainingUsed.length > 0) {
      this.selectedUsageItem = item;    
      this.displayUsageDialog = true;   
    } 
    // Kullanılmıyorsa Bilgi Ver
    else {
      // Şimdilik alert ile gösteriyoruz, ilerde Toast mesajına çevirebiliriz
      alert('Bu içerik şu an herhangi bir eğitimde kullanılmamaktadır.');
    }
  }

  deleteContent(item: any) {
    if (!confirm(`"${item.fileName}" dosyasını silmek istediğinize emin misiniz?`)) {
      return;
    }

    this.contentService.deleteFile(item.id).subscribe({
      next: (res: any) => {
        if (res.header && res.header.result) {
          this.files = this.files.filter(f => f.id !== item.id);
        } else {
          // Alert yerine basit bir log veya toast
          console.error(res.header?.msg);
        }
      },
      error: (err) => console.error('Silme hatası:', err)
    });
  }
}