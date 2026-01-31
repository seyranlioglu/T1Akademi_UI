import { Component, OnInit, HostListener } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { ContentLibraryApiService } from 'src/app/shared/api/content-library-api.service';
import { UploadModalComponent } from 'src/app/components/common/modals/upload-modal/upload-modal.component';
import { ContentPreviewModalComponent } from 'src/app/components/common/modals/content-preview-modal/content-preview-modal.component';

@Component({
  selector: 'app-content-library-selector',
  templateUrl: './content-library-selector.component.html',
  styleUrls: ['./content-library-selector.component.scss'],
  providers: [DialogService]
})
export class ContentLibrarySelectorComponent implements OnInit {

  contents: any[] = []; 
  filteredContents: any[] = []; 
  loading: boolean = true;
  searchText: string = '';
  
  selectedId: number | null = null;
  openMenuId: number | null = null;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private contentLibraryService: ContentLibraryApiService,
    private dialogService: DialogService
  ) { }

  ngOnInit(): void {
    this.loadLibrary();
  }

  @HostListener('document:click')
  closeMenu() {
    this.openMenuId = null;
  }

  loadLibrary() {
    this.loading = true;
    this.contentLibraryService.getLibrary().subscribe({
      next: (res: any) => {
        const rawData = res.data || res.body || res || [];
        
        // Backend'den gelen veri yapısını koruyoruz, sadece eksik alan varsa dolduruyoruz.
        this.contents = rawData.map((item: any) => {
            // Eğer backend 'FileName' (PascalCase) dönüyorsa 'fileName' (camelCase) de olsun.
            // Ama orijinal item'ı bozmadan genişletiyoruz.
            return {
                ...item, // Orijinal verileri koru
                id: item.id || item.Id,
                fileName: item.fileName || item.FileName,
                title: item.title || item.Title || item.fileName || item.FileName, 
                fileType: item.fileType || item.FileType || '',
                thumbnail: item.thumbnail || item.Thumbnail,
                duration: item.videoDuration || item.VideoDuration,
                pageCount: item.documentPageCount || item.DocumentPageCount,
                fileSize: item.documentFileSize || item.DocumentFileSize,
                filePath: item.filePath || item.FilePath
            };
        });

        this.onSearchChange(this.searchText);
        this.loading = false;
      },
      error: (err) => {
        console.error("Kütüphane yüklenemedi", err);
        this.loading = false;
      }
    });
  }

  onSearchChange(searchValue: string) {
    this.searchText = searchValue;
    if (!this.searchText || this.searchText.trim() === '') {
      this.filteredContents = [...this.contents];
      return;
    }
    const term = this.searchText.toLowerCase();
    this.filteredContents = this.contents.filter(item => 
      (item.fileName && item.fileName.toLowerCase().includes(term)) || 
      (item.title && item.title.toLowerCase().includes(term))
    );
  }

  selectContent(item: any) {
    if (this.openMenuId !== null) {
        this.openMenuId = null;
        return;
    }
    this.selectedId = item.id;
    setTimeout(() => {
      this.ref.close(item);
    }, 150);
  }

  toggleMenu(id: number, event: Event) {
    event.stopPropagation();
    if (this.openMenuId === id) {
        this.openMenuId = null;
    } else {
        this.openMenuId = id;
    }
  }

  openUploadModal() {
    const uploadRef = this.dialogService.open(UploadModalComponent, {
      header: 'Yeni İçerik Yükle',
      width: '500px', // LibraryComponent ile aynı genişlik
      contentStyle: { overflow: 'visible' },
      baseZIndex: 10001,
      modal: true,
      dismissableMask: false
    });

    uploadRef.onClose.subscribe((success: boolean) => {
      if (success) this.loadLibrary();
    });
  }

  // 🔥 DÜZELTİLDİ: Veri Gönderim Formatı LibraryComponent ile Eşleşti
  openPreview(item: any, event: Event) {
    event.stopPropagation();
    this.openMenuId = null;

    this.dialogService.open(ContentPreviewModalComponent, {
        header: item.fileName || item.title, // Header dosya adı olsun
        width: '80%',
        height: 'auto',
        baseZIndex: 10002,
        modal: true,
        dismissableMask: true,
        data: item // 🔥 KRİTİK: item objesi doğrudan gönderiliyor
    });
  }

  formatBytes(bytes: number, decimals = 2) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}