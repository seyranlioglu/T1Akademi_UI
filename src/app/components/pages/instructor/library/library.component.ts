import { Component, OnInit, HostListener } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
// environment importuna artık gerek yok, sildik.

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
  // imageBaseUrl sildik, artık ihtiyacımız yok.
  
  activeMenuId: number | null = null; 

  // Dialog Değişkenleri
  displayUsageDialog: boolean = false;
  selectedUsageItem: any = null;

  constructor(
    private dialogService: DialogService,
    private contentService: ContentLibraryApiService
  ) {}

  ngOnInit(): void {
    this.getFiles();
  }

  // Menü İşlemleri
  toggleMenu(event: Event, id: number) {
    event.stopPropagation(); 
    if (this.activeMenuId === id) {
      this.activeMenuId = null; 
    } else {
      this.activeMenuId = id; 
    }
  }

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

getIconOrThumbnail(item: any): string {
    // 1. ÖNCE YOUTUBE KONTROLÜ (Uzantıdan bağımsız)
    // Eğer dosya yolu bir web linki ise ve youtube içeriyorsa
    if (item.filePath && (item.filePath.includes('youtube.com') || item.filePath.includes('youtu.be'))) {
        // Thumbnail varsa onu göster, yoksa varsayılan youtube ikonu göster
        return item.thumbnail ? item.thumbnail : 'assets/images/file-types/youtube.png';
    }

    // 2. Dosya uzantısını al
    const extension = item.fileName ? item.fileName.split('.').pop().toLowerCase() : '';

    // A. PDF
    if (extension === 'pdf') {
        return 'assets/images/file-types/pdf.png'; 
    }

    // B. Resim
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension)) {
        return item.filePath ? item.filePath : 'assets/images/file-types/image-error.png';
    }

    // C. Video (MinIO'daki fiziksel dosyalar)
    if (['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(extension)) {
        return item.thumbnail ? item.thumbnail : 'assets/images/file-types/video.png';
    }

    // D. Hiçbiri değilse
    return 'assets/images/file-types/file.png';
  }

  openUploadModal() {
    const ref = this.dialogService.open(UploadModalComponent, {
      header: 'Yeni İçerik Yükle', 
      width: '500px', 
      contentStyle: { overflow: 'visible' },
      appendTo: 'body', 
      baseZIndex: 10000, 
      modal: true, 
      dismissableMask: false
      // NOT: UploadModalComponent içinde input accept=".pdf, .mp4, .jpg, .png" eklemelisin!
    });
    ref.onClose.subscribe((success: boolean) => { if (success) this.getFiles(); });
  }

  openPreview(item: any) {
    const ref = this.dialogService.open(ContentPreviewModalComponent, {
      header: item.fileName, 
      width: '80%', 
      height: 'auto', 
      baseZIndex: 10000,
      modal: true, 
      dismissableMask: true, 
      data: item 
    });
    ref.onClose.subscribe((updated: boolean) => { if (updated) this.getFiles(); });
  }

  showUsage(item: any) {
    this.activeMenuId = null;
    if (item.trainingUsed && item.trainingUsed.length > 0) {
      this.selectedUsageItem = item;    
      this.displayUsageDialog = true;   
    } else {
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
          console.error(res.header?.msg);
        }
      },
      error: (err) => console.error('Silme hatası:', err)
    });
  }
}