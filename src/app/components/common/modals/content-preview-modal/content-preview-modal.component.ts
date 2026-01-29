import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ContentLibraryApiService } from 'src/app/shared/api/content-library-api.service';

@Component({
  selector: 'app-content-preview-modal',
  templateUrl: './content-preview-modal.component.html',
  styleUrls: ['./content-preview-modal.component.scss']
})
export class ContentPreviewModalComponent implements OnInit {
  
  data: any;
  editForm!: FormGroup; 
  loading = false;
  
  fullPath: string = '';
  
  // Dosya Tipleri
  isVideo = false;
  isPdf = false;
  isImage = false;
  isYoutube = false;

  // Youtube Embed Linki
  youtubeEmbedUrl: string = '';

  // --- RETRY / UPLOAD DEĞİŞKENLERİ (YENİ) ---
  needsUpload = false;        // Dosya yüklenmesi gerekiyor mu?
  errorMessage = '';          // Hata mesajı
  selectedRetryFile: File | null = null;
  isUploading = false;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private fb: FormBuilder,
    private contentService: ContentLibraryApiService
  ) {
    this.data = this.config.data;
  }

  ngOnInit(): void {
    this.setupFile();
    this.initForm();
  }

  setupFile() {
    // 0. HATA KONTROLÜ
    // Status 3 = Failed varsayıyoruz (Backend Enum'ına göre). 
    // Veya filePath boşsa ve bu bir Youtube videosu değilse (Youtube'da path linktir).
    if (this.data.status === 3 || !this.data.filePath) {
        this.needsUpload = true;
        this.errorMessage = this.data.errorMessage;
        // Hata varsa diğer kontrollere (video, pdf vs.) girmeye gerek yok.
        return; 
    }

    if (this.data.filePath) {
      this.fullPath = this.data.filePath; 
      
      // 1. YouTube Kontrolü
      if (this.fullPath.includes('youtube.com') || this.fullPath.includes('youtu.be')) {
         this.isYoutube = true;
         this.youtubeEmbedUrl = this.getYoutubeEmbedUrl(this.fullPath);
      }
      else {
          // 2. Diğer Dosyalar
          const ext = this.data.fileName?.split('.').pop()?.toLowerCase();
          
          if (['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(ext)) {
            this.isVideo = true;
          } else if (ext === 'pdf') {
            this.isPdf = true;
          } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) {
            this.isImage = true;
          }
      }
    }
  }

  // --- RETRY UPLOAD İŞLEMLERİ ---

  onRetryFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
        this.selectedRetryFile = file;
    }
  }

  startRetryUpload() {
    if (!this.selectedRetryFile) return;

    this.isUploading = true;
    
    // Servisteki 'uploadMedia' metodunu (mevcut ID'ye dosya basan metot) kullanıyoruz.
    this.contentService.uploadMedia(this.data.id, this.selectedRetryFile).subscribe({
        next: (res) => {
            if (res.header.result) {
                alert('Dosya başarıyla yüklendi ve onarıldı!');
                this.ref.close(true); // Modalı kapat ve listeyi yenile
            } else {
                alert(res.header.message);
            }
            this.isUploading = false;
        },
        error: (err) => {
            console.error(err);
            alert('Yükleme sırasında hata oluştu.');
            this.isUploading = false;
        }
    });
  }

  // --- MEVCUT HELPER METODLAR ---

  getYoutubeEmbedUrl(url: string): string {
    let videoId = '';
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (match && match[1]) {
        videoId = match[1];
    }
    return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
  }

  getGoogleViewerUrl(url: string): string {
    return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
  }

  initForm() {
    this.editForm = this.fb.group({
      title: [this.data.title || this.data.fileName, Validators.required],
      description: [this.data.description || '']
    });
  }

  saveChanges() {
    if (this.editForm.invalid) return;

    this.loading = true;
    const formVal = this.editForm.value;

    this.contentService.updateContent(this.data.id, formVal).subscribe({
      next: (res: any) => {
        if (res?.header?.result) {
          this.ref.close(true); 
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}