import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { GlobalUploadService } from 'src/app/shared/services/global-upload.service';
import { ContentLibraryApiService } from 'src/app/shared/api/content-library-api.service';

@Component({
  selector: 'app-upload-modal',
  templateUrl: './upload-modal.component.html',
  styleUrls: ['./upload-modal.component.scss']
})
export class UploadModalComponent {
  
  // Tab Yönetimi: 'file' veya 'youtube'
  activeTab: 'file' | 'youtube' = 'file';

  // Dosya Yükleme Formu
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  isDragOver = false;

  // YouTube Formu
  youtubeForm: FormGroup;
  youtubeLoading = false;

  constructor(
    private fb: FormBuilder,
    public ref: DynamicDialogRef,
    private uploadService: GlobalUploadService,
    private contentService: ContentLibraryApiService
  ) {
    // 1. Dosya Formu
    this.uploadForm = this.fb.group({
      title: ['', Validators.required],
      description: ['']
    });

    // 2. YouTube Formu
    this.youtubeForm = this.fb.group({
      title: ['', Validators.required],
      url: ['', [Validators.required, Validators.pattern(/^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/)]],
      description: ['']
    });
  }

  // --- TAB DEĞİŞİMİ ---
  switchTab(tab: 'file' | 'youtube') {
    this.activeTab = tab;
  }

  // --- DOSYA YÜKLEME METOTLARI ---
  
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  handleFile(file: File) {
    this.selectedFile = file;
    if (!this.uploadForm.get('title')?.value) {
      this.uploadForm.patchValue({ title: file.name });
    }
  }

  startUpload() {
    if (this.uploadForm.valid && this.selectedFile) {
      this.uploadService.startUpload(this.selectedFile, this.uploadForm.value);
      this.ref.close(true);
    }
  }

  formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  // --- YOUTUBE KAYIT METOTLARI ---

saveYoutube() {
    if (this.youtubeForm.invalid) return;

    this.youtubeLoading = true;
    const formVal = this.youtubeForm.value;

    // ARTIK ID YOK, DESCRIPTION VAR
    this.contentService.addYoutubeContent(
        formVal.title, 
        formVal.url, 
        formVal.description
    ).subscribe({
        next: (res) => {
            if(res.header.result) {
                this.ref.close(true);
            } else {
                // Backend'den gelen hata mesajını göster (Toast veya Alert)
                alert(res.header.message);
            }
            this.youtubeLoading = false;
        },
        error: (err) => {
            console.error(err);
            alert("YouTube videosu eklenirken bir hata oluştu.");
            this.youtubeLoading = false;
        }
    });
  }
}