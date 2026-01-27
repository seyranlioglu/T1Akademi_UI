import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { GlobalUploadService } from 'src/app/shared/services/global-upload.service';

@Component({
  selector: 'app-upload-modal',
  templateUrl: './upload-modal.component.html',
  styleUrls: ['./upload-modal.component.scss']
})
export class UploadModalComponent {
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  isDragOver = false; // Sürükleme durumu için

  constructor(
    private fb: FormBuilder,
    public ref: DynamicDialogRef,
    private uploadService: GlobalUploadService
  ) {
    this.uploadForm = this.fb.group({
      title: ['', Validators.required],
      description: ['']
    });
  }

  // --- DRAG & DROP EVENTS ---

  // Dosya alanın üzerine gelince
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  // Dosya alandan çıkınca
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  // Dosya bırakılınca
  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  // Input'tan seçilince (Tıklayarak)
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  // Ortak Dosya İşleme Metodu
  handleFile(file: File) {
    this.selectedFile = file;
    // Eğer başlık boşsa, dosya adını otomatik yaz
    if (!this.uploadForm.get('title')?.value) {
      this.uploadForm.patchValue({ title: file.name });
    }
  }

  // Yüklemeyi Başlat
  startUpload() {
    if (this.uploadForm.valid && this.selectedFile) {
      this.uploadService.startUpload(this.selectedFile, this.uploadForm.value);
      this.ref.close(true);
    }
  }

  // Helper: Dosya boyutunu okunabilir yap
  formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }
}